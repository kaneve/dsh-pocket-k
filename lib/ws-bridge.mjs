// WebSocket 回落通道（WS over HTTP）：绕开「只允许 HTTP、掐掉 TCP+SNI 的 WebSocket」的网络。
//
// 背景（issue：远程界面能开、会话能载入，但 wss:// 连不上）：
//   某些网络（如国内按 SNI 阻断的自建域名）会 RST 掉到该域名的 **新建 TCP+TLS** 连接，
//   而页面与 /api 的普通 HTTP 请求能活下来（浏览器用 ECH/HTTP3 走既有连接）。
//   DSH 的实时通道 /api/remote.mux 是 WebSocket —— 只能新建 TCP —— 于是表现为
//   "界面能打开、会话能加载，但 connection lost / retry"。
//   而 WS 地址由 DSH 客户端写死为「页面自身 origin」（dsh-api-gateway/lib/client.js
//   remoteStreamUrl() 取 globalThis.location.origin），插件无法把它指到别的域名。
//
// 做法（只改插件，不动 DSH 一行代码）：
//   1) 浏览器侧：注入 polyfill，包一层 window.WebSocket。**先照常尝试原生 WS**，
//      只有「打开前 error/close」或「超时仍未 open」时才回落到本通道；
//      回落后仍完整实现 WebSocket API（readyState / addEventListener / send / close，
//      以及 WebSocket.OPEN 等静态常量），DSH 客户端无感知。
//   2) 宿主侧：本模块提供 HTTP 端点，把浏览器的帧搬进一条真 WS（连本机 dsh web），
//      再把上游帧通过 SSE 推回浏览器。HTTP 走的就是那条「能通」的路径。
//
// 安全：端点与其它路径共用同一套设备会话门禁（代理在外面统一校验后再进来），
// 上游 WS 同样只连 loopback 并注入代理代铸的 DSH 认证 cookie，不新增任何暴露面。

import { randomUUID } from 'node:crypto';

/** 桥端点路径（GET 开流；POST ?act=send / ?act=close，均以 sid 关联）。 */
export const WS_BRIDGE_PATH = '/__dsh-pocket-k/ws';

/** 注入标记：注入判重与测试用。 */
export const WS_FALLBACK_MARK = 'data-dsh-pocket-k-ws-fallback="1"';

/** 浏览器侧回落到本通道前，等原生 WS 的时间（毫秒）。 */
const FALLBACK_DELAY_MS = 2000;

/** 单帧上限（DSH mux 帧是 JSON 文本，4MB 足够；防止恶意超大 body 撑爆内存）。 */
const MAX_FRAME_BYTES = 4 * 1024 * 1024;

/** SSE 心跳间隔：隧道/NAT 对空闲长连接有超时，注释行既保活又不打扰事件解析。 */
const SSE_PING_MS = 15_000;

/** 桥接的上游路径（DSH 的实时通道）。 */
export const WS_BRIDGE_UPSTREAM_PATH = '/api/remote.mux';

/**
 * 宿主侧桥：把「HTTP 请求」翻译成对上游的一条 WebSocket 连接。
 * @param {object} opts
 * @param {{host:string,port:number}} opts.upstream 上游 dsh web 地址（loopback）
 * @param {string} [opts.path] 上游 WS 路径，默认 /api/remote.mux
 * @param {(msg:string)=>void} [opts.log] 日志回调
 * @param {number} [opts.maxFrameBytes] 单帧上限
 * @param {number} [opts.pingMs] SSE 心跳间隔
 * @returns {{handle:(req:any,res:any,ctx:{headers:any})=>boolean, size:()=>number, closeAll:()=>void}}
 */
export function createWsBridge({ upstream, path = WS_BRIDGE_UPSTREAM_PATH, log = null, maxFrameBytes = MAX_FRAME_BYTES, pingMs = SSE_PING_MS } = {}) {
  /** sid -> { socket, res, ping, closed } */
  const sessions = new Map();

  function sseSend(session, payload) {
    if (session.closed || session.res.writableEnded) return;
    try {
      session.res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch { /* 客户端已断开：close 事件里会清理 */ }
  }

  function teardown(session, { closeSocket = true } = {}) {
    if (session.closed) return;
    session.closed = true;
    clearInterval(session.ping);
    sessions.delete(session.sid);
    if (closeSocket) {
      try { session.socket.close(); } catch { /* 已关闭 */ }
    }
    try { if (!session.res.writableEnded) session.res.end(); } catch { /* 已结束 */ }
  }

  /** GET：开流（SSE 下游 + 反向一条上游 WS）。 */
  function startStream(req, res, headers) {
    const sid = randomUUID();
    const session = { sid, res, ping: null, closed: false, socket: null, upstreamOpen: false, pending: [] };
    res.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-store',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
      'x-pocket-ws-bridge': sid,
    });
    // 立即 flush（部分代理会等首个 body 才下发响应头）
    res.write(': open\n\n');

    let socket;
    try {
      // Node 内置 WebSocket（undici）支持 { headers }：自定义头 + loopback 权威由代理注入
      socket = new WebSocket(`ws://${upstream.host}:${upstream.port}${path}`, { headers });
    } catch (err) {
      sseSend(session, { k: 'e', m: `bridge open failed: ${err?.message ?? err}` });
      teardown(session, { closeSocket: false });
      return;
    }
    session.socket = socket;
    sessions.set(sid, session);
    session.ping = setInterval(() => {
      if (!session.closed && !res.writableEnded) {
        try { res.write(': ping\n\n'); } catch { /* 断开时由 close 清理 */ }
      }
    }, pingMs);
    session.ping.unref?.();

    socket.addEventListener('open', () => {
      // 上游就绪才告诉浏览器「open」——否则第一帧会打到 CONNECTING 的 socket 上
      session.upstreamOpen = true;
      sseSend(session, { k: 'open' });
      for (const frame of session.pending.splice(0)) {
        try { socket.send(frame); } catch { /* 已关闭 */ }
      }
    });
    socket.addEventListener('message', (ev) => {
      const data = ev?.data;
      if (typeof data === 'string') {
        sseSend(session, { k: 'm', b: Buffer.from(data, 'utf8').toString('base64'), bin: 0 });
      } else {
        const buf = Buffer.isBuffer(data) ? data : Buffer.from(data ?? []);
        sseSend(session, { k: 'm', b: buf.toString('base64'), bin: 1 });
      }
    });
    socket.addEventListener('close', (ev) => {
      sseSend(session, { k: 'c', code: ev?.code ?? 1006, reason: String(ev?.reason ?? '') });
      teardown(session, { closeSocket: false });
    });
    socket.addEventListener('error', () => {
      sseSend(session, { k: 'e', m: 'upstream websocket error' });
      teardown(session, { closeSocket: false });
    });
    res.on('close', () => teardown(session));
    log?.(`dsh-pocket-k: ws-bridge open sid=${sid.slice(0, 8)}`);
  }

  /** POST body 读取（带上限）。 */
  function readBody(req, cb) {
    const chunks = [];
    let size = 0;
    let aborted = false;
    req.on('data', (c) => {
      if (aborted) return;
      size += c.length;
      if (size > maxFrameBytes) {
        aborted = true;
        cb(new Error('frame too large'));
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => { if (!aborted) cb(null, Buffer.concat(chunks)); });
    req.on('error', () => { if (!aborted) { aborted = true; cb(new Error('request error')); } });
  }

  function respondJson(res, status, payload) {
    const body = JSON.stringify(payload);
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    res.end(body);
  }

  /**
   * 处理一条桥请求。
   * @returns {boolean} 是否由本桥处理（false = 不是桥路径，交回代理）
   */
  function handle(req, res) {
    let url;
    try { url = new URL(req.url ?? '/', 'http://x'); } catch { return false; }
    if (url.pathname !== WS_BRIDGE_PATH) return false;
    const act = url.searchParams.get('act') ?? 'open';
    if (act === 'open') {
      if (req.method !== 'GET') { respondJson(res, 405, { error: 'method not allowed' }); return true; }
      startStream(req, res, req.__pocketBridgeHeaders ?? {});
      return true;
    }
    const session = sessions.get(url.searchParams.get('sid') ?? '');
    if (!session) { respondJson(res, 404, { error: 'no such bridge session' }); return true; }
    if (act === 'close') {
      // 先告诉客户端「通道关闭」，再拆（teardown 之后 sseSend 会被 closed 挡住）
      sseSend(session, { k: 'c', code: 1000, reason: 'client close' });
      try { session.socket.close(1000, 'client close'); } catch { /* 已关闭 */ }
      teardown(session, { closeSocket: false });
      respondJson(res, 200, { ok: true });
      return true;
    }
    if (act === 'send') {
      if (req.method !== 'POST') { respondJson(res, 405, { error: 'method not allowed' }); return true; }
      readBody(req, (err, buf) => {
        if (err) { respondJson(res, 413, { error: String(err.message) }); return; }
        const text = /^text\//i.test(String(req.headers['content-type'] ?? ''));
        const data = text ? buf.toString('utf8') : buf;
        // 上游还没 open（握手进行中）时先排队，open 后按序 flush——避免 410 丢帧
        if (!session.upstreamOpen) {
          if (session.pending.length >= 512) { respondJson(res, 429, { error: 'too many queued frames' }); return; }
          session.pending.push(data);
          respondJson(res, 200, { ok: true, queued: true });
          return;
        }
        try {
          session.socket.send(data);
          respondJson(res, 200, { ok: true });
        } catch (sendErr) {
          respondJson(res, 410, { error: `send failed: ${sendErr?.message ?? sendErr}` });
        }
      });
      return true;
    }
    respondJson(res, 400, { error: `unknown act: ${act}` });
    return true;
  }

  return {
    handle,
    size: () => sessions.size,
    closeAll: () => { for (const s of [...sessions.values()]) teardown(s); },
  };
}

/**
 * 浏览器侧回落 polyfill 的**裸代码**（不含 <script> 标签；单测直接用 vm 跑它）。
 *
 * 只包 /api/remote.mux（同源）；其它 WebSocket 一律原样交给原生实现。
 * 事件/常量/方法覆盖 DSH 客户端实际用到的全部表面：
 * addEventListener（含 once）、onopen/onmessage/onerror/onclose、readyState、
 * WebSocket.OPEN 等静态常量、send(string|ArrayBuffer|TypedArray)、close()。
 */
export const WS_FALLBACK_CODE = `!function(){try{
if(window.__dshPocketWsFallback){return;}if(!window.WebSocket||!window.fetch){return;}
var Native=window.WebSocket,MUX='/api/remote.mux',BRIDGE=${JSON.stringify(WS_BRIDGE_PATH)},DELAY=${FALLBACK_DELAY_MS};
function forced(){try{return /(^|[?&])__pocket_ws=bridge(&|$)/.test(String(location.search||''))||(window.sessionStorage&&window.sessionStorage.getItem('__pocketWsBridge')==='1');}catch(e){return false;}}
function isMux(u){try{var x=new URL(String(u),location.href);return x.pathname===MUX&&x.host===location.host;}catch(e){return false;}}
function b64ToBytes(b){var s=atob(b),a=new Uint8Array(s.length);for(var i=0;i<s.length;i++){a[i]=s.charCodeAt(i);}return a;}
function b64ToText(b){var s=atob(b);if(typeof TextDecoder!=='undefined'){try{return new TextDecoder().decode(b64ToBytes(b));}catch(e){}}
  return s;}
function Sock(url,protocols){
  this.url=String(url);this.protocol='';this.binaryType='blob';this.readyState=0;
  this.__ls={};this.__mode='native';this.__queue=[];this.__sid=null;this.__sending=false;this.__done=false;this.__closedEarly=false;
  var self=this;
  if(forced()){this.__native=null;this.__toBridge('forced');return;}
  this.__timer=setTimeout(function(){self.__toBridge('timeout');},DELAY);
  try{this.__native=new Native(url,protocols);}catch(e){this.__native=null;}
  if(this.__native){
    this.__native.addEventListener('open',function(){self.__adopt();});
    this.__native.addEventListener('close',function(ev){if(self.__mode==='native'){self.__toBridge('native close '+(ev&&ev.code));}});
    this.__native.addEventListener('error',function(){if(self.__mode==='native'){self.__toBridge('native error');}});
    this.__native.addEventListener('message',function(ev){if(self.__mode==='native'){self.__emit('message',{data:ev.data});}});
  }else{this.__toBridge('no native');}
}
// 注意：**不能**让 Sock 继承原生 WebSocket 原型。原生原型上的 readyState/binaryType 等是
// 带内部槽校验的访问器，普通对象赋值/读取会抛 "Illegal invocation"（实测踩过）。
Sock.prototype={constructor:Sock};
Sock.prototype.addEventListener=function(t,fn,opt){var once=!!(opt&&opt.once);(this.__ls[t]=this.__ls[t]||[]).push({fn:fn,once:once});};
Sock.prototype.removeEventListener=function(t,fn){var a=this.__ls[t];if(!a){return;}for(var i=a.length-1;i>=0;i--){if(a[i].fn===fn){a.splice(i,1);}}};
Sock.prototype.__emit=function(t,ev){ev=ev||{};ev.type=t;if(ev.target===undefined){ev.target=this;}
  var h=this['on'+t];if(typeof h==='function'){try{h.call(this,ev);}catch(e){}}
  var a=this.__ls[t];if(a){a=a.slice();for(var i=0;i<a.length;i++){var it=a[i];if(it.once){this.removeEventListener(t,it.fn);}try{it.fn.call(this,ev);}catch(e){}}}};
Sock.prototype.__adopt=function(){if(this.__mode!=='native'){try{this.__native.close();}catch(e){}return;}
  clearTimeout(this.__timer);this.__mode='native-open';this.readyState=1;this.protocol=this.__native.protocol||'';this.__emit('open');};
Sock.prototype.__toBridge=function(reason){
  if(this.__mode!=='native'){return;}clearTimeout(this.__timer);this.__mode='bridge-opening';
  var self=this;
  try{if(this.__native){this.__native.close();}}catch(e){}
  if(this.__closedEarly){return;}
  fetch(BRIDGE+'?act=open',{credentials:'same-origin',cache:'no-store',headers:{'accept':'text/event-stream'}}).then(function(res){
    if(!res.ok||!res.body){throw new Error('bridge http '+res.status);}
    self.__sid=res.headers.get('x-pocket-ws-bridge');
    self.__mode='bridge';self.__pump(res.body.getReader(),typeof TextDecoder!=='undefined'?new TextDecoder():null);
  }).catch(function(e){self.__fail('bridge unavailable: '+(e&&e.message));});
};
Sock.prototype.__fail=function(msg){if(this.__done){return;}this.__done=true;this.readyState=3;
  try{this.__emit('error',{message:String(msg||'')});}catch(e){}this.__emit('close',{code:1006,reason:String(msg||''),wasClean:false});};
Sock.prototype.__pump=function(reader,dec){var self=this,buf='';
  function step(){reader.read().then(function(r){
    if(r.done){self.__fail('bridge stream ended');return;}
    var chunk=r.value;buf+=(dec?dec.decode(chunk,{stream:true}):String.fromCharCode.apply(null,new Uint8Array(chunk)));var idx;
    while((idx=buf.indexOf('\\n'))>=0){var line=buf.slice(0,idx);buf=buf.slice(idx+1);self.__line(line);}
    step();
  }).catch(function(e){self.__fail('bridge read: '+(e&&e.message));});}
  step();};
Sock.prototype.__line=function(line){if(!line||line.charAt(0)===':'){return;}
  if(line.slice(0,6)!=='data: '){return;}
  var msg;try{msg=JSON.parse(line.slice(6));}catch(e){return;}
  if(msg.k==='m'){var data;
    if(msg.bin){var bytes=b64ToBytes(msg.b);data=this.binaryType==='arraybuffer'?bytes.buffer:new Blob([bytes]);}
    else{data=b64ToText(msg.b);}
    this.__emit('message',{data:data});
  }else if(msg.k==='open'){if(!this.__opened){this.__opened=true;this.readyState=1;this.__emit('open');}}
  else if(msg.k==='c'){if(!this.__done){this.__done=true;this.readyState=3;this.__emit('close',{code:msg.code||1000,reason:msg.reason||'',wasClean:true});}}
  else if(msg.k==='e'){this.__fail(msg.m||'bridge error');}};
Sock.prototype.send=function(data){if(this.__mode==='native-open'){return this.__native.send(data);}
  if(this.__mode==='bridge'||this.__mode==='bridge-opening'){this.__queue.push(data);this.__flush();return;}
  throw new Error('WebSocket is not open');};
Sock.prototype.__flush=function(){var self=this;if(this.__sending||!this.__queue.length){return;}
  this.__sending=true;var item=this.__queue.shift();var binary=!(typeof item==='string');
  fetch(BRIDGE+'?act=send&sid='+encodeURIComponent(this.__sid||''),{method:'POST',credentials:'same-origin',cache:'no-store',
    headers:{'content-type':binary?'application/octet-stream':'text/plain;charset=utf-8'},body:item}).then(function(res){
      self.__sending=false;if(!res.ok){self.__fail('bridge send http '+res.status);return;}self.__flush();
    }).catch(function(e){self.__sending=false;self.__fail('bridge send: '+(e&&e.message));});};
Sock.prototype.close=function(code,reason){this.__closedEarly=true;
  if(this.__mode==='native'||this.__mode==='native-open'){try{this.__native.close(code,reason);}catch(e){}}
  if(this.__mode==='bridge'){try{fetch(BRIDGE+'?act=close&sid='+encodeURIComponent(this.__sid||''),{method:'POST',credentials:'same-origin',cache:'no-store'});}catch(e){}}
  if(!this.__done){this.__done=true;this.readyState=3;this.__emit('close',{code:code||1000,reason:String(reason||''),wasClean:true});}};
function Wrapped(url,protocols){if(!isMux(url)){return new Native(url,protocols);}return new Sock(url,protocols);}
Wrapped.prototype=Native.prototype;
Wrapped.CONNECTING=0;Wrapped.OPEN=1;Wrapped.CLOSING=2;Wrapped.CLOSED=3;
// instanceof 兼容：mux 连接返回的是包装对象（不继承原生原型），用 Symbol.hasInstance 兜底
if(typeof Symbol!=='undefined'&&Symbol.hasInstance){try{Object.defineProperty(Wrapped,Symbol.hasInstance,{value:function(x){return x instanceof Sock||x instanceof Native;}});}catch(e){}}
window.WebSocket=Wrapped;window.__dshPocketWsFallback=1;
}catch(e){}}();`;

/** 注入到 DSH 页面 <head> 的完整脚本标签。 */
export const WS_FALLBACK_SCRIPT = `<script ${WS_FALLBACK_MARK}>${WS_FALLBACK_CODE}</script>`;
