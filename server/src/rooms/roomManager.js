import {Room} from './room.js';
const PERMANENT_COUNT=10;
export class RoomManager{
 constructor(){this.rooms=new Map();for(let i=1;i<=PERMANENT_COUNT;i++){const code=`LUMI-${String(i).padStart(2,'0')}`;this.rooms.set(code,new Room(code,{name:`LUMI ROOM ${i}`,permanent:true,private:false}))}}
 create({name='Private LUMI Room',privateRoom=true}={}){let r=new Room(undefined,{name,private:privateRoom,permanent:false});while(this.rooms.has(r.code))r=new Room(undefined,{name,private:privateRoom});this.rooms.set(r.code,r);return r}
 get(c){return this.rooms.get(String(c||'').toUpperCase())}
 join(c,p,opts={}){let r;if(c==='CREATE')r=this.create({name:opts.name||'LUMI ROOM',privateRoom:!!opts.privateRoom});else if(c)r=this.get(c);else return null;if(!r||r.players.size>=20)return null;r.add(p);return r}
 leave(r,id){if(!r)return;r.remove(id);if(!r.players.size&&!r.permanent)this.rooms.delete(r.code)}
 publicList(){return [...this.rooms.values()].filter(r=>!r.private).map(r=>({code:r.code,name:r.name,count:r.players.size,max:20,permanent:r.permanent,started:r.started,minPlayers:2,remaining:r.remaining()}))}
 tick(){for(const r of this.rooms.values())r.tick()}
}
