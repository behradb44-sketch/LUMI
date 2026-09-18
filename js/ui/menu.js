const COLORS=["#55dce4","#ed5c62","#62d68b","#a879e8","#f0ce58","#f17fc5"];
export function setupUI({game,network,voice}){
 const menu=document.getElementById("menu"),hud=document.getElementById("hud"),lobby=document.getElementById("roomLobby"),chars=document.getElementById("characters"),status=document.getElementById("menuStatus"),roomList=document.getElementById("roomList");
 const lobbyCode=document.getElementById("lobbyRoomCode"),invite=document.getElementById("inviteLink"),waitCount=document.getElementById("waitCount"),waitTitle=document.getElementById("waitTitle"),waitingPlayers=document.getElementById("waitingPlayers"),playGame=document.getElementById("playGame"),hostHint=document.getElementById("hostHint"),copyInvite=document.getElementById("copyInvite"),copyStatus=document.getElementById("copyStatus");
 let selected=Number(localStorage.selectedCharacter||0);
 COLORS.forEach((c,i)=>{const d=document.createElement("button");d.className="char"+(i===selected?" selected":"");d.innerHTML=`<i style="background:${c}"></i>`;d.onclick=()=>{selected=i;document.querySelectorAll(".char").forEach(x=>x.classList.remove("selected"));d.classList.add("selected")};chars.append(d)});
 const name=document.getElementById("username");name.value=localStorage.lastUsername||"";
 function user(){const n=(name.value.trim()||"LumiPlayer").slice(0,16);localStorage.lastUsername=n;localStorage.selectedCharacter=selected;return n}
 function connect(room){status.textContent=room?"Joining Room…":"Creating Room…";network.connect({username:user(),character:selected,room})}
 function renderRooms(list=[]){
  roomList.innerHTML="";
  if(!list.length){roomList.innerHTML='<div class="rooms-loading">No public rooms available yet.</div>';return}
  list.forEach(r=>{const card=document.createElement("article");card.className="room-card";const state=r.started?"IN GAME":`${r.count} / ${r.max}`;card.innerHTML=`<div><strong>${esc(r.name)}</strong><small>${r.permanent?"PERMANENT ROOM":"PUBLIC ROOM"}</small></div><div class="room-meta"><b>${state}</b><button type="button">ENTER ROOM</button></div>`;card.querySelector("button").onclick=()=>{if(!r.started&&r.count>=r.max)return;connect(r.code)};roomList.append(card)})
 }
 function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
 function renderLobby(m){
  document.querySelector(".room-link-wrap").style.display=network.isHost?"block":"none";
  const opt=document.querySelector(".host-options");if(opt)opt.style.display=network.isHost&&!network.started&&!m?.permanent?"flex":"none";
  const code=network.room||m?.code||m?.room||"—",players=m?.players||[],count=m?.count??players.length,max=m?.max??20;
  lobbyCode.textContent=`ROOM ${code}`;waitCount.textContent=`${count} / ${max} players`;waitingPlayers.innerHTML="";
  players.forEach(p=>{const d=document.createElement("div");d.className="waiting-player"+(p.id===network.hostId?" host":"");d.textContent=(p.id===network.hostId?"★ ":"")+p.name;waitingPlayers.append(d)});
  const hasGuest=count>1;waitTitle.textContent=network.started?"GAME STARTING":"WAITING FOR PLAYERS";
  playGame.classList.toggle("hidden",!(network.isHost&&!network.started&&hasGuest));
  hostHint.textContent=network.isHost?(hasGuest?"A player joined. Start the game when you’re ready.":"Share the invite link with your friends."):"Waiting for the room host to start the game.";
  const privateToggle=document.getElementById("privateRoom");if(privateToggle)privateToggle.checked=!!m?.private;
  const timer=document.getElementById("roomTimer");if(timer){if(m?.permanent&&!network.started&&m?.remaining!=null){const sec=Math.ceil(m.remaining/1000);timer.textContent=sec>0?`AUTO START IN ${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`:"STARTING…"}else timer.textContent=""}
 }
 function openLobby(m){menu.classList.add("hidden");hud.classList.add("hidden");lobby.classList.remove("hidden");const url=new URL(location.href);url.searchParams.set("room",network.room);invite.value=url.href;history.replaceState({},"",url);renderLobby(m)}
 document.getElementById("create").onclick=()=>connect("CREATE",{privateRoom:!!createPrivate?.checked,roomName:(name.value.trim()||"LUMI ROOM").slice(0,24)});
 network.on("room-list",m=>{if(menu&&!menu.classList.contains("hidden"))renderRooms(m.rooms||[])});
 network.on("welcome",m=>{openLobby(m);if(m.started){network.started=true;hud.classList.remove("hidden");lobby.classList.add("hidden")}});
 network.on("room-state",m=>{if(!lobby.classList.contains("hidden"))renderLobby(m);else if(!network.started)renderRooms(m.rooms||[]) });
 network.on("game-start",()=>{network.started=true;lobby.classList.add("hidden");hud.classList.remove("hidden")});
 network.on("room-full",()=>status.textContent="Room is full");network.on("room-not-found",()=>status.textContent="Room not found");network.on("error",m=>status.textContent=m.message||"Server error");
 copyInvite.onclick=async()=>{const value=invite.value;if(!value)return;try{await navigator.clipboard.writeText(value);copyStatus.textContent="Copied!"}catch{invite.focus();invite.select();copyStatus.textContent="Select the link and copy it."}setTimeout(()=>copyStatus.textContent="",2200)};
 playGame.onclick=()=>{if(network.isHost&&!network.started){playGame.disabled=true;playGame.textContent="STARTING…";network.startGame()}};
 document.getElementById("leaveRoom").onclick=()=>{network.close(true);network.connectArgs=null;lobby.classList.add("hidden");hud.classList.add("hidden");menu.classList.remove("hidden");const u=new URL(location.href);u.searchParams.delete("room");history.replaceState({},"",u);status.textContent="Ready"};
 const privateRoom=document.getElementById("privateRoom");privateRoom?.addEventListener("change",()=>{if(network.isHost&&!network.started)network.setPrivate(privateRoom.checked)});
 const send=()=>{const i=document.getElementById("chatInput"),t=i.value.trim();if(t){network.chat(t);i.value=""}};document.getElementById("sendChat").onclick=send;document.getElementById("chatInput").onkeydown=e=>e.key==="Enter"&&send();
 async function mic(){const on=await voice.toggle();document.getElementById("micBtn").textContent=on?"🔊":"🎙";document.getElementById("mobileMic").textContent=on?"🔊":"🎙"}document.getElementById("micBtn").onclick=mic;document.getElementById("mobileMic").onclick=mic;
 const toggle=el=>el.classList.toggle("hidden");document.getElementById("mapBtn").onclick=()=>toggle(document.getElementById("mapOverlay"));document.getElementById("closeMap").onclick=()=>toggle(document.getElementById("mapOverlay"));document.getElementById("invBtn").onclick=()=>toggle(document.getElementById("inventoryOverlay"));document.getElementById("closeInv").onclick=()=>toggle(document.getElementById("inventoryOverlay"));document.getElementById("menuBtn").onclick=()=>toggle(menu);
 document.getElementById("jumpBtn").onpointerdown=()=>game.input.jump=true;document.getElementById("jumpBtn").onpointerup=()=>game.input.jump=false;document.getElementById("interactBtn").onclick=()=>network.interact("pulse");document.getElementById("buildBtn").onclick=()=>network.build(0);
 const joy=document.getElementById("joystick"),knob=joy.querySelector("span");function joyMove(e){const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,l=Math.min(Math.hypot(dx,dy),34),a=Math.atan2(dy,dx),x=Math.cos(a)*l/34,y=Math.sin(a)*l/34;knob.style.transform=`translate(${x*25}px,${y*25}px)`;game.mobileVec={x,y}}function joyEnd(){knob.style.transform="";game.mobileVec=null}joy.onpointermove=joyMove;joy.onpointerdown=e=>{joy.setPointerCapture(e.pointerId);joyMove(e)};joy.onpointerup=joyEnd;joy.onpointercancel=joyEnd;
 const roomQ=new URLSearchParams(location.search).get("room");if(roomQ)setTimeout(()=>connect(roomQ),700);else setTimeout(()=>menu.classList.remove("hidden"),1200);
 network.connect({username:user(),character:selected,room:null});
}
