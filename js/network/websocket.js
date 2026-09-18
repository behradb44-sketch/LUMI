import {CONFIG} from "../config.js";
export class Network{
 constructor(cfg){
  this.cfg=cfg;this.ws=null;this.listeners={};this.room=null;this.clientId=null;this.hostId=null;
  this.isHost=false;this.started=false;this.connected=false;this.retry=0;this.connectArgs=null;this._closing=false;
 }
 on(t,f){(this.listeners[t]??=[]).push(f);return()=>this.listeners[t]=this.listeners[t].filter(x=>x!==f)}
 emit(t,d){for(const f of this.listeners[t]||[])try{f(d)}catch(e){console.error(e)}}
 connect(args){
  this.connectArgs={...args};this.close(true);this._closing=false;
  const q=new URLSearchParams({username:args.username||"LumiPlayer",character:String(args.character??0)});
  if(args.room)q.set("room",args.room);
  if(args.privateRoom)q.set("private","1");
  if(args.roomName)q.set("roomName",args.roomName);
  this.emit("status",args.room==="CREATE"?"Creating Room…":args.room?"Joining Room…":"Finding Players…");
  let ws;try{ws=new WebSocket(`${this.cfg.BACKEND_WS}/ws?${q.toString()}`)}catch(e){this.emit("status","Connection Failed");return}
  this.ws=ws;
  ws.onopen=()=>{this.connected=true;this.retry=0;this.emit("status","Connected")};
  ws.onmessage=e=>{try{this.route(JSON.parse(e.data))}catch(err){console.warn("Bad packet",err)}};
  ws.onerror=()=>this.emit("status","Connection Failed");
  ws.onclose=()=>{
   const was=this.connected;this.connected=false;
   if(this.connectArgs&&!this._closing&&this.retry<7){
    this.retry++;this.emit("status","Reconnecting…");
    setTimeout(()=>this.connect(this.connectArgs),Math.min(7000,600*this.retry*this.retry));
   }else if(!was&&!this._closing)this.emit("status","Connection Failed");
  };
 }
 route(m){
  if(m.type==="welcome"){
   this.clientId=m.id;this.room=m.room;this.hostId=m.hostId;this.isHost=!!m.host;this.started=!!m.started;
  }else if(m.type==="game-start"){
   this.started=true;
  }else if(m.type==="room-state"){
   this.hostId=m.hostId;this.started=!!m.started;this.isHost=this.clientId===m.hostId;
  }
  this.emit(m.type,m);
 }
 send(type,data={}){if(this.ws?.readyState===WebSocket.OPEN)this.ws.send(JSON.stringify({type,...data}))}
 startGame(){this.send("start-game")}
 setPrivate(value){this.send("set-private",{value:!!value})}
 move(x,y,state,jump=false){if(!this.started)return;this.send("move",{x,y,state,jump})}
 chat(text){this.send("chat",{text})}
 interact(action){if(!this.started)return;this.send("interact",{action})}
 build(typeId){if(!this.started)return;this.send("build",{typeId})}
 signal(to,data){this.send("signal",{to,data})}
 close(permanent=false){this._closing=permanent;try{this.ws?.close()}catch{}}
}
