import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";
import {WebSocketServer} from "ws";
import {PORT} from "./config.js";
import {RoomManager} from "./rooms/roomManager.js";
import {Player} from "./rooms/player.js";
import {RateLimiter} from "./security/rateLimit.js";
import {route} from "./websocket/messageRouter.js";

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(__dirname,"../..");
const rooms=new RoomManager();
const clients=new Map();

const mime={
 ".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",
 ".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",
 ".svg":"image/svg+xml",".ico":"image/x-icon",".mp3":"audio/mpeg",".wav":"audio/wav"
};

function send(res,status,data,type="application/json"){
 res.writeHead(status,{"Content-Type":type,"Cache-Control":"no-store","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type"});
 res.end(type.startsWith("application/json")?JSON.stringify(data):data);
}
function safeName(v){
 return String(v??"").replace(/[<>]/g,"").trim().slice(0,16)||"LumiPlayer";
}
function listPacket(){return JSON.stringify({type:"room-list",rooms:rooms.publicList()})}
function broadcastList(){
 const packet=listPacket();
 for(const c of clients.values()) if(!c.room && c.ws.readyState===1)c.ws.send(packet);
}
function readBody(req){
 return new Promise((resolve,reject)=>{
  let s="";req.on("data",d=>{s+=d;if(s.length>10000)req.destroy()});
  req.on("end",()=>{try{resolve(s?JSON.parse(s):{})}catch{reject(new Error("Invalid JSON"))}});
  req.on("error",reject);
 });
}
function staticFile(req,res){
 let pathname=new URL(req.url,"http://localhost").pathname;
 if(pathname==="/")pathname="/index.html";
 const full=path.resolve(ROOT,"."+pathname);
 if(!full.startsWith(ROOT+path.sep))return send(res,403,{error:"Forbidden"});
 fs.stat(full,(err,st)=>{
  if(!err&&st.isFile()){
   res.writeHead(200,{"Content-Type":mime[path.extname(full).toLowerCase()]||"application/octet-stream","Cache-Control":pathname.startsWith("/assets/")?"public,max-age=86400":"no-cache"});
   fs.createReadStream(full).pipe(res); return;
  }
  // SPA fallback
  const index=path.join(ROOT,"index.html");
  res.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store"});
  fs.createReadStream(index).pipe(res);
 });
}

const server=http.createServer(async(req,res)=>{
 try{
  const u=new URL(req.url,"http://localhost");
  if(req.method==="OPTIONS"){res.writeHead(204,{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type"});return res.end()}
  if(u.pathname==="/health")return send(res,200,{status:"ok",game:"LUMI",rooms:rooms.rooms.size});
  if(u.pathname==="/api/rooms"&&req.method==="GET")return send(res,200,{rooms:rooms.publicList()});
  if(u.pathname==="/api/rooms"&&req.method==="POST"){
   const body=await readBody(req);
   const r=rooms.create({name:safeName(body.name)||"LUMI ROOM",privateRoom:!!body.privateRoom});
   return send(res,201,{code:r.code,name:r.name,private:r.private,invite:`${u.origin}/?room=${encodeURIComponent(r.code)}`});
  }
  if(u.pathname.startsWith("/api/rooms/")&&req.method==="GET"){
   const r=rooms.get(decodeURIComponent(u.pathname.split("/").pop()));
   if(!r)return send(res,404,{error:"Room not found"});
   return send(res,200,r.state());
  }
  return staticFile(req,res);
 }catch(e){console.error(e);return send(res,500,{error:"Server error"})}
});

const wss=new WebSocketServer({noServer:true});
server.on("upgrade",(req,socket,head)=>{
 try{
  const u=new URL(req.url,"http://localhost");
  if(u.pathname!=="/ws"){socket.destroy();return}
  wss.handleUpgrade(req,socket,head,ws=>wss.emit("connection",ws,req));
 }catch{socket.destroy()}
});

wss.on("connection",(ws,req)=>{
 const u=new URL(req.url,"http://localhost");
 const requested=(u.searchParams.get("room")||"").trim().toUpperCase();
 const p=new Player(crypto.randomUUID(),safeName(u.searchParams.get("username")),Number(u.searchParams.get("character")));
 p.ws=ws;
 const ctx={ws,room:null,player:p,limiter:new RateLimiter(60,1000)};
 clients.set(ws,ctx);

 const sendRooms=()=>{if(ws.readyState===1)ws.send(listPacket())};
 if(!requested){
  sendRooms();
  ws.on("message",raw=>{try{const m=JSON.parse(raw);if(m.type==="ping")ws.send(JSON.stringify({type:"pong"}))}catch{}});
  ws.on("close",()=>clients.delete(ws));
  return;
 }

 const room=rooms.joinOrCreate(requested,p,{
  name:safeName(u.searchParams.get("roomName"))||"LUMI ROOM",
  privateRoom:u.searchParams.get("private")==="1"
 });
 if(!room){
  if(ws.readyState===1)ws.send(JSON.stringify({type:requested==="CREATE"?"room-error":"room-not-found",message:"Room is full or unavailable"}));
  clients.delete(ws);ws.close();return;
 }
 ctx.room=room;
 const welcome={type:"welcome",id:p.id,room:room.code,roomName:room.name,hostId:room.hostId,host:p.id===room.hostId,started:room.started,private:room.private,permanent:room.permanent,player:{id:p.id,name:p.name,character:p.character,color:p.color,x:p.x,y:p.y,state:p.state},players:room.snapshot(),objective:room.objective,event:room.event,remaining:room.remaining()};
 ws.send(JSON.stringify(welcome));
 room.broadcast({type:"room-state",...room.state(),remaining:room.remaining()});
 broadcastList();

 ws.on("message",raw=>{
  try{
   const m=JSON.parse(raw);
   if(m.type==="set-private"){
    if(p.id!==room.hostId||room.permanent||room.started)return;
    room.private=!!m.value;
    room.broadcast({type:"room-state",...room.state(),remaining:room.remaining()});
    broadcastList();return;
   }
   route(m,ctx);
  }catch(e){console.error("LUMI WS message:",e.message)}
 });
 ws.on("close",()=>{
  const c=clients.get(ws);if(!c)return;
  rooms.leave(room,p.id);clients.delete(ws);
  room.broadcast({type:"player-left",id:p.id});
  room.broadcast({type:"room-state",...room.state(),remaining:room.remaining()});
  broadcastList();
 });
});

const timer=setInterval(()=>{
 rooms.tick();
 const now=Date.now();
 for(const r of rooms.rooms.values()){
  if(r.started)r.broadcast({type:"state",players:r.snapshot(),objective:r.objective,event:r.event});
  else if(r.permanent&&r.players.size)r.broadcast({type:"room-state",...r.state(),remaining:r.remaining()});
 }
 if(now%2000<60)broadcastList();
},50);

server.listen(PORT,()=>console.log(`LUMI unified server listening on ${PORT}`));
process.on("SIGTERM",()=>{clearInterval(timer);server.close(()=>process.exit(0))});
