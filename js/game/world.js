const R=(n)=>{let x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x)};
export class World{
 constructor(cfg){this.w=cfg.WORLD.w;this.h=cfg.WORLD.h;this.t=0;this.wind=.35;this.trees=[];this.grass=[];this.flowers=[];this.clouds=[];this.buildings=[];this.ripples=[];this.leaves=[];this.make()}
 make(){let i=0,seed=0;while(this.trees.length<115&&seed<5000){const x=80+R(seed*3+1)*(this.w-160),y=80+R(seed*7+2)*(this.h-160);seed++;if(x>1180&&x<2400&&y>720&&y<1680)continue;this.trees.push({x,y,s:.65+R(seed)*.85,p:R(seed*9)*6.28,lean:R(seed*4)});i++} 
 for(let i=0;i<420;i++)this.grass.push({x:R(i*2)*this.w,y:R(i*5)*this.h,p:R(i*11)*6.28,a:.5+R(i*3)*.9})
 for(let i=0;i<120;i++)this.flowers.push({x:R(i*13)*this.w,y:R(i*17)*this.h,p:R(i*19)*6.28,c:["#e9c96b","#ef88ad","#8ad9a4","#9fb7ef"][i%4]})
 for(let i=0;i<18;i++)this.clouds.push({x:R(i*21)*this.w,y:100+R(i*23)*380,s:.8+R(i*31)*1.3,p:R(i*37)*6.28})}
 blocked(x,y){for(const t of this.trees){const rr=22*(t.s||1);if((x-t.x)**2+(y-(t.y+10))**2<(18+rr)**2)return true}for(const b of this.buildings){if(Math.abs(x-b.x)<50&&Math.abs(y-b.y)<50)return true}return false}\n update(dt,wind=.35){this.t+=dt;this.wind=wind;for(const r of this.ripples){r.t+=dt;r.a=1-r.t/.8}this.ripples=this.ripples.filter(r=>r.t<.8)}
 ripple(x,y){this.ripples.push({x,y,t:0})}
 draw(c,cam,z,event){c.save();c.translate(-cam.x*z,-cam.y*z);c.scale(z,z);
 // layered sky/terrain
 const g=c.createLinearGradient(0,0,0,this.h);g.addColorStop(0,"#173d45");g.addColorStop(.45,"#2b604d");g.addColorStop(1,"#1b443b");c.fillStyle=g;c.fillRect(0,0,this.w,this.h);
 // region zones
 this.zone(c,0,0,1180,2400,"#263e4a"); // city
 this.zone(c,2400,0,1200,720,"#304f54"); // cloud
 this.zone(c,0,1680,1180,720,"#31584d"); // beach
 this.zone(c,2400,720,1200,840,"#314c35"); // volcano
 this.zone(c,1180,1680,1220,720,"#2f5460"); // snow
 this.zone(c,1180,0,1220,720,"#224c42"); // forest
 // river
 c.fillStyle="#205b6c";c.beginPath();c.moveTo(0,360);c.bezierCurveTo(750,520,950,900,1580,760);c.bezierCurveTo(2150,630,2600,430,3600,590);c.lineTo(3600,830);c.bezierCurveTo(2700,720,2250,950,1620,1000);c.bezierCurveTo(930,1080,700,720,0,600);c.closePath();c.fill();
 // water highlights
 for(let i=0;i<90;i++){let x=(i*193+this.t*25*(1+i%3))%this.w,y=560+Math.sin(i*1.8)*170;c.fillStyle=i%3?"#63a9a2":"#8ed3c3";c.fillRect(x,y,12+(i%4)*5,2)}
 // distant clouds parallax
 for(const cl of this.clouds){let x=(cl.x+this.t*(8+cl.s*5))%this.w;c.save();c.globalAlpha=.18+.06*cl.s;c.translate(x,cl.y);c.fillStyle="#d9eee1";c.fillRect(-28*cl.s,-7,80*cl.s,13);c.fillRect(-10*cl.s,-15,48*cl.s,18);c.restore()}
 // grass/flowers
 for(const gr of this.grass){if(gr.x<1180&&gr.y<1700)continue;const a=Math.sin(this.t*(2+gr.a)+gr.p)*.18*this.wind;c.save();c.translate(gr.x,gr.y);c.rotate(a);c.fillStyle="#73a967";c.fillRect(0,-5,2,7);c.fillRect(3,-4,2,6);c.restore()}
 for(const f of this.flowers){const a=Math.sin(this.t*3+f.p)*.12*this.wind;c.save();c.translate(f.x,f.y);c.rotate(a);c.fillStyle=f.c;c.fillRect(-2,-3,4,4);c.fillStyle="#5d9b60";c.fillRect(0,1,2,7);c.restore()}
 // landmarks
 this.landmarks(c);
 for(const tr of this.trees)this.tree(c,tr);
 for(const b of this.buildings)this.build(c,b);
 this.fire(c,2820,1500);
 for(const r of this.ripples){c.strokeStyle=`rgba(157,226,213,${r.a})`;c.lineWidth=2;c.beginPath();c.ellipse(r.x,r.y,10+r.t*34,5+r.t*17,0,0,Math.PI*2);c.stroke()}
 // weather/event layers
 this.weather(c,event);
 c.restore()}
 zone(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h);for(let i=0;i<12;i++){c.fillStyle="rgba(255,255,255,.018)";c.fillRect(x+(i*97)%w,y+(i*151)%h,80,35)}}
 landmarks(c){ // city streets, sidewalks and blocks
 c.fillStyle="#16252e";c.fillRect(0,0,1180,1680);
 c.fillStyle="#30464d";for(let x=40;x<1180;x+=260)c.fillRect(x,0,42,1680);for(let y=55;y<1680;y+=250)c.fillRect(0,y,1180,38);
 c.fillStyle="#d4b866";for(let x=0;x<1180;x+=260)for(let y=0;y<1680;y+=250){c.fillRect(x+18,y+17,7,3);c.fillRect(x+68,y+17,7,3)}
 c.fillStyle="#172b35";for(let i=0;i<12;i++){let x=100+(i%4)*250,y=100+Math.floor(i/4)*260;c.fillRect(x,y,145,105);c.fillStyle="#3c6670";for(let j=0;j<4;j++)c.fillRect(x+18+j*29,y+20,12,12);c.fillStyle="#172b35"}
 // beach sand strip
 c.fillStyle="#c6a86c";c.fillRect(0,1860,1180,540);c.fillStyle="#e0c884";for(let i=0;i<60;i++)c.fillRect((i*71)%1180,1880+(i*43)%500,26,3)
 // snow island
 c.fillStyle="#b8d1d5";c.fillRect(1180,1680,1220,720);c.fillStyle="#d9eeee";for(let i=0;i<40;i++)c.fillRect(1200+(i*101)%1180,1700+(i*83)%680,30,12)
 // volcano
 c.fillStyle="#3a2c2d";c.beginPath();c.moveTo(2500,1560);c.lineTo(2760,980);c.lineTo(3100,1560);c.closePath();c.fill();c.fillStyle="#cf6044";c.fillRect(2735,1100,50,360)
 // space/glitch pads
 c.fillStyle="#17203b";c.fillRect(2400,0,1200,720);c.fillStyle="#4b64a1";for(let i=0;i<70;i++)c.fillRect(2420+(i*67)%1160,20+(i*101)%650,2,2)
 c.fillStyle="#2c1b44";c.fillRect(2400,720,1200,120);for(let i=0;i<35;i++)c.fillStyle=i%2?"#bc6be4":"#5de5db",c.fillRect(2420+(i*97)%1160,740+(i*31)%75,18,3)
 }
 tree(c,t){const sway=Math.sin(this.t*(1.1+t.s*.5)+t.p)*.045*this.wind;const leafS=Math.sin(this.t*2.2+t.p)*.06*this.wind;c.save();c.translate(t.x,t.y);c.scale(t.s,t.s);c.fillStyle="#4c352c";c.fillRect(-6,-2,12,43);c.fillStyle="#5e4235";c.fillRect(-25,2,22,5);c.fillRect(3,4,23,5);c.save();c.rotate(sway);c.fillStyle="#315a3c";c.fillRect(-35,-43,70,48);c.fillStyle="#477a48";c.fillRect(-45,-25,90,31);c.fillStyle="#6a9955";c.fillRect(-25,-55,50,28);for(let i=0;i<9;i++){const a=Math.sin(this.t*(1.8+i*.13)+t.p+i)*.13*this.wind;c.save();c.translate(-36+i*9,-19+(i%3)*-7);c.rotate(a);c.fillStyle=i%3?"#75a85c":"#8cbb69";c.fillRect(0,0,8,5);c.restore()}c.restore();c.restore()}
 build(c,b){c.fillStyle=b.type==="wall"?"#876b53":b.type==="lamp"?"#e3c66b":"#b1946c";c.fillRect(b.x-20,b.y-20,40,40);if(b.type==="lamp"){c.fillStyle="#ffe8a0";c.fillRect(b.x-7,b.y-12,14,14)}else{c.fillStyle="#604a3c";c.fillRect(b.x-5,b.y+3,10,17)}}
 fire(c,x,y){const q=.9+Math.sin(this.t*9)*.08;c.fillStyle="#4a3228";c.fillRect(x-23,y+4,46,7);c.fillRect(x-17,y-2,34,7);c.fillStyle="#ffcc63";c.fillRect(x-8,y-31*q,16,28*q);c.fillStyle="#ff7446";c.fillRect(x-4,y-24*q,9,22*q);for(let i=0;i<5;i++){c.fillStyle="#ffd36b";c.fillRect(x-17+i*8,y-38-Math.sin(this.t*5+i)*5,2,4)}}
 weather(c,event){if(event==="HEAVY_WIND"||event==="PIXEL_STORM"){c.strokeStyle="#b8e4df55";for(let i=0;i<80;i++){let x=(i*83+this.t*300)%this.w,y=(i*137+this.t*160)%this.h;c.beginPath();c.moveTo(x,y);c.lineTo(x+22,y+3);c.stroke()}}
 if(event==="CHOCOLATE_RAIN"){for(let i=0;i<90;i++){let x=(i*137)%this.w,y=(this.t*300+i*79)%this.h;c.fillStyle="#9c674b";c.fillRect(x,y,3,10)}}
 if(event==="PURPLE_NIGHT"){c.fillStyle="rgba(67,29,111,.38)";c.fillRect(0,0,this.w,this.h)}
 if(event==="LOW_GRAVITY"){c.fillStyle="#b7d6ff";for(let i=0;i<35;i++){let x=(i*179+this.t*22)%this.w,y=(i*91+Math.sin(this.t+i)*20)%this.h;c.fillRect(x,y,2,2)}}
 if(event==="GLITCH_EVENT"){for(let i=0;i<20;i++){c.fillStyle=i%2?"#ef62e355":"#54e9dd55";c.fillRect((i*311+this.t*70)%this.w,(i*127)%this.h,70,4)}}}
}