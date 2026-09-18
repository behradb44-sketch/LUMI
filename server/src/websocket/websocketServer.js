import {WebSocketServer} from "ws";
import crypto from "node:crypto";
import {RoomManager} from "../rooms/roomManager.js";
import {Player} from "../rooms/player.js";
import {RateLimiter} from "../security/rateLimit.js";
import {name} from "../security/validation.js";
import {route} from "./messageRouter.js";
export function attach(server){
 const wss=new WebSocketServer({server,path:'/ws'}),rooms=new RoomManager(),clients=new Map();
 const broadcastList=()=>{const packet=JSON.stringify({type:'room-list',rooms:rooms.publicList()});for(const ctx of clients.values())if(ctx.ws.readyState===1)ctx.ws.send(packet)};
 wss.on('connection',(ws,req)=>{
  const u=new URL(req.url,'http://localhost');const requestedRoom=(u.searchParams.get('room')||'').trim().toUpperCase();
  const p=new Player(crypto.randomUUID(),name(u.searchParams.get('username')),Number(u.searchParams.get('character')));p.ws=ws;
  const ctx={ws,room:null,player:p,limiter:new RateLimiter(40,1000)};clients.set(ws,ctx);
  if(!requestedRoom){ws.send(JSON.stringify({type:'room-list',rooms:rooms.publicList()}));ws.on('message',raw=>{try{const m=JSON.parse(raw);if(m.type==='set-private'||m.type==='start-game'||m.type==='move'||m.type==='chat'||m.type==='signal'||m.type==='voice-state'||m.type==='interact'||m.type==='build')return}catch(e){}});ws.on('close',()=>clients.delete(ws));return}
  const room=rooms.join(requestedRoom,p,{name:(u.searchParams.get('roomName')||'LUMI ROOM').slice(0,24),privateRoom:u.searchParams.get('private')==='1'});
  if(!room){ws.send(JSON.stringify({type:requestedRoom==='CREATE'?'room-error':'room-not-found',message:'Room is unavailable'}));clients.delete(ws);ws.close();return}
  ctx.room=room;
  ws.send(JSON.stringify({type:'welcome',id:p.id,room:room.code,roomName:room.name,hostId:room.hostId,host:p.id===room.hostId,started:room.started,private:room.private,permanent:room.permanent,player:{id:p.id,name:p.name,character:p.character,color:p.color,x:p.x,y:p.y,state:p.state},players:room.snapshot(),objective:room.objective,event:room.event,remaining:room.remaining()}));
  room.broadcast({type:'room-state',...room.state()}); broadcastList();
  ws.on('message',raw=>{try{const m=JSON.parse(raw);if(m.type==='set-private'){if(p.id!==room.hostId||room.permanent||room.started)return;room.private=!!m.value;room.broadcast({type:'room-state',...room.state()});broadcastList();return}route(m,ctx)}catch(e){console.error(e)}});
  ws.on('close',()=>{const c=clients.get(ws);if(!c)return;room.remove(p.id);clients.delete(ws);room.broadcast({type:'player-left',id:p.id});room.broadcast({type:'room-state',...room.state(),hostChanged:true});if(!room.players.size&&!room.permanent)rooms.rooms.delete(room.code);broadcastList()});
 });
 let lastLobbyPulse=0;
 const timer=setInterval(()=>{rooms.tick();const now=Date.now();for(const r of rooms.rooms.values()){if(r.started)r.broadcast({type:'state',players:r.snapshot(),objective:r.objective,event:r.event});else if(r.permanent&&r.players.size&&now-lastLobbyPulse>=1000)r.broadcast({type:'room-state',...r.state(),remaining:r.remaining()})}if(now-lastLobbyPulse>=1000){lastLobbyPulse=now;broadcastList()}},1000/2);
 wss.on('close',()=>clearInterval(timer));return wss;
}
