import {Room} from './room.js';

const PERMANENT_COUNT=10;

export class RoomManager{
 constructor(){
  this.rooms=new Map();
  for(let i=1;i<=PERMANENT_COUNT;i++){
   const code=`LUMI-${String(i).padStart(2,'0')}`;
   this.rooms.set(code,new Room(code,{name:`LUMI ROOM ${i}`,permanent:true,private:false}));
  }
 }
 create({name='LUMI ROOM',privateRoom=false}={}){
  let r=new Room(undefined,{name,private:privateRoom,permanent:false});
  while(this.rooms.has(r.code)) r=new Room(undefined,{name,private:privateRoom});
  this.rooms.set(r.code,r);
  return r;
 }
 get(c){return this.rooms.get(String(c||'').trim().toUpperCase())}
 join(c,p){
  const r=this.get(c);
  if(!r || r.started && r.players.size>=20 || r.players.size>=20) return null;
  r.add(p);
  return r;
 }
 joinOrCreate(c,p,opts={}){
  if(String(c).toUpperCase()==='CREATE'){
   const r=this.create(opts); r.add(p); return r;
  }
  return this.join(c,p);
 }
 leave(r,id){
  if(!r)return;
  r.remove(id);
  if(!r.players.size&&!r.permanent)this.rooms.delete(r.code);
 }
 publicList(){
  return [...this.rooms.values()]
   .filter(r=>!r.private)
   .map(r=>({code:r.code,name:r.name,count:r.players.size,max:20,permanent:r.permanent,started:r.started,minPlayers:2,remaining:r.remaining()}));
 }
 tick(){for(const r of this.rooms.values())r.tick()}
}
