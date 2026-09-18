export class VoiceChat{
 constructor(net){this.net=net;this.peers=new Map();this.audio=new Map();this.stream=null;this.enabled=false;
  net.on("voice-users",m=>this.sync(m.users||[]));net.on("signal",m=>this.signal(m));net.on("player-left",m=>this.remove(m.id))
 }
 async toggle(){if(this.enabled){this.stop();return false}try{this.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});this.enabled=true;for(const id of this.peers.keys())this.offer(id);this.net.send("voice-state",{enabled:true});return true}catch(e){console.warn("Mic permission unavailable",e);return false}}
 stop(){this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;this.enabled=false;this.net.send("voice-state",{enabled:false})}
 make(id){const pc=new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});this.peers.set(id,pc);if(this.stream)this.stream.getTracks().forEach(t=>pc.addTrack(t,this.stream));pc.onicecandidate=e=>e.candidate&&this.net.signal(id,{candidate:e.candidate});pc.ontrack=e=>{let a=this.audio.get(id);if(!a){a=new Audio();a.autoplay=true;a.playsInline=true;this.audio.set(id,a)}a.srcObject=e.streams[0]};pc.onconnectionstatechange=()=>{if(["failed","closed"].includes(pc.connectionState))this.remove(id)};return pc}
 sync(ids){for(const id of ids)if(id!==this.net.clientId&&!this.peers.has(id))this.make(id)}
 async offer(id){const pc=this.peers.get(id)||this.make(id);const o=await pc.createOffer();await pc.setLocalDescription(o);this.net.signal(id,{description:pc.localDescription})}
 async signal(m){if(m.from===this.net.clientId)return;const pc=this.peers.get(m.from)||this.make(m.from),d=m.data;if(d.description){await pc.setRemoteDescription(d.description);if(d.description.type==="offer"){const a=await pc.createAnswer();await pc.setLocalDescription(a);this.net.signal(m.from,{description:pc.localDescription})}}if(d.candidate)try{await pc.addIceCandidate(d.candidate)}catch{}}
 remove(id){this.peers.get(id)?.close();this.peers.delete(id);const a=this.audio.get(id);if(a){a.srcObject=null;this.audio.delete(id)}}
}