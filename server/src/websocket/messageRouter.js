import crypto from 'node:crypto';import {chat,pos} from "../security/validation.js";import {relay} from "../webrtc/signaling.js";
export function route(m,c){
 const {player,room,limiter}=c;if(!m||typeof m.type!=='string'||!room)return;
 if(m.type==='start-game'){if(player.id!==room.hostId||room.players.size<2||room.started)return;room.start();return}
 if(m.type==='move'){
  if(!room.started||!limiter.allow('move:'+player.id))return;
  const x=Number(m.x),y=Number(m.y);if(!pos(x,y))return;
  const dt=Math.max(.016,(Date.now()-player.lastMove)/1000),max=(m.state==='run'?300:190)*dt+28;
  if(Math.hypot(x-player.x,y-player.y)>max)return;
  player.x=x;player.y=y;player.state=['idle','walk','run','jump'].includes(m.state)?m.state:'walk';player.lastMove=Date.now();
  return;
 }
 if(m.type==='chat'){if(!limiter.allow('chat:'+player.id))return;const t=chat(m.text);if(t)room.broadcast({type:'chat',id:player.id,name:player.name,text:t});return}
 if(m.type==='signal'){if(m.to&&m.data)relay(room,player.id,m.to,m.data);return}
 if(m.type==='voice-state'){
  player.mic=!!m.enabled;
  room.broadcast({type:'voice-users',users:[...room.players.values()].filter(p=>p.mic).map(p=>p.id)});
  return;
 }
 if(m.type==='interact'){if(!room.started||!limiter.allow('interact:'+player.id))return;if(room.objective.progress<room.objective.stages){room.objective.progress++;room.broadcast({type:'objective',objective:room.objective})}return}
 if(m.type==='build'){if(!room.started||!limiter.allow('build:'+player.id))return;const types=['wall','floor','chair','table','bed','lamp','tree','painting'];room.buildings.push({id:crypto.randomUUID?.()||String(Date.now()),type:types[Number(m.typeId)||0],x:player.x,y:player.y,owner:player.id});room.broadcast({type:'build-state',buildings:room.buildings})}
}
