import {OBJECTIVES} from "../game/objectives.js";
import {EVENTS} from "../game/gameEvents.js";
const code=()=>Math.random().toString(36).slice(2,8).toUpperCase();
const MIN_PLAYERS=2;
const MAX_PLAYERS=20;
export class Room{
 constructor(c=code(),opts={}){
  this.code=c; this.name=opts.name||`LUMI ROOM ${c}`; this.permanent=!!opts.permanent; this.private=!!opts.private;
  this.players=new Map(); this.hostId=null; this.started=false; this.waitStartedAt=0; this.extensionStartedAt=0;
  this.objective=structuredClone(OBJECTIVES[Math.floor(Math.random()*OBJECTIVES.length)]);
  this.event=EVENTS[Math.floor(Math.random()*EVENTS.length)]; this.buildings=[]; this.nextEvent=Date.now()+30000+Math.random()*45000;
 }
 add(p){if(!this.hostId)this.hostId=p.id;this.players.set(p.id,p);if(this.permanent&&!this.started&&!this.waitStartedAt)this.waitStartedAt=Date.now()}
 remove(id){this.players.delete(id);if(this.hostId===id){const next=this.players.values().next().value;this.hostId=next?.id||null}}
 broadcast(o,except){const s=JSON.stringify(o);for(const p of this.players.values())if(p.ws?.readyState===1&&p.id!==except)p.ws.send(s)}
 snapshot(){return [...this.players.values()].map(p=>({id:p.id,name:p.name,character:p.character,color:p.color,x:p.x,y:p.y,state:p.state,mic:p.mic}))}
 state(){return {code:this.code,name:this.name,private:this.private,permanent:this.permanent,hostId:this.hostId,started:this.started,players:this.snapshot(),count:this.players.size,max:MAX_PLAYERS,minPlayers:MIN_PLAYERS,waitStartedAt:this.waitStartedAt,extensionStartedAt:this.extensionStartedAt}}
 remaining(){if(!this.permanent||this.started||!this.waitStartedAt)return null;const now=Date.now();if(!this.extensionStartedAt)return Math.max(0,300000-(now-this.waitStartedAt));return Math.max(0,180000-(now-this.extensionStartedAt))}
 start(){if(this.started)return false;this.started=true;this.broadcast({type:'game-start',hostId:this.hostId,objective:this.objective,event:this.event});this.broadcast({type:'room-state',...this.state()});return true}
 tick(){
  if(!this.started&&this.permanent&&this.players.size){
   if(this.players.size>=MIN_PLAYERS)this.start();
   else if(!this.extensionStartedAt&&Date.now()-this.waitStartedAt>=300000){this.extensionStartedAt=Date.now();this.broadcast({type:'room-state',...this.state(),timerPhase:'extension'})}
   else if(this.extensionStartedAt&&Date.now()-this.extensionStartedAt>=180000)this.start();
  }
  if(this.started&&Date.now()>=this.nextEvent){this.event=EVENTS[Math.floor(Math.random()*EVENTS.length)];this.nextEvent=Date.now()+45000+Math.random()*60000;this.broadcast({type:'event',event:this.event})}
 }
}
