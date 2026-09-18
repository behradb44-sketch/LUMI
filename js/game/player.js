const PAL=["#55dce4","#ed5c62","#62d68b","#a879e8","#f0ce58","#f17fc5"];
export class Player{
 constructor(d,local=false){Object.assign(this,d);this.local=local;this.x??=0;this.y??=0;this.targetX=this.x;this.targetY=this.y;this.vx=0;this.vy=0;this.time=0;this.state=d.state||"idle";this.dir=1;this.jumpT=0;this.color=d.color||PAL[(Number(d.character)||0)%PAL.length]}
 update(dt,input,world){this.time+=dt;if(!this.local){const dx=this.targetX-this.x,dy=this.targetY-this.y;this.x+=dx*Math.min(1,dt*12);this.y+=dy*Math.min(1,dt*12);return}const speed=input.run?270:155;let x=input.x,y=input.y,l=Math.hypot(x,y);if(l){x/=l;y/=l;this.vx=x*speed;this.vy=y*speed;this.state=input.run?"run":"walk";if(Math.abs(x)>.08)this.dir=x<0?-1:1}else{this.vx*=Math.pow(.0005,dt);this.vy*=Math.pow(.0005,dt);this.state="idle"}const nx=this.x+this.vx*dt,ny=this.y+this.vy*dt;if(!world?.blocked?.(nx,this.y))this.x=nx;if(!world?.blocked?.(this.x,ny))this.y=ny;if(input.jump&&this.jumpT<=0){this.jumpT=.46;this.state="jump"}if(this.jumpT>0){this.jumpT-=dt;if(this.jumpT<=0)this.state=l?(input.run?"run":"walk"):"idle"}this.x=Math.max(45,Math.min(3555,this.x));this.y=Math.max(45,Math.min(2355,this.y))}
 draw(c,z,camera){const speed=this.state==="run"?16:this.state==="walk"?10:2.4,cycle=Math.sin(this.time*speed),bob=this.jumpT>0?-10+Math.abs(Math.sin(this.time*10))*3:this.state==="idle"?Math.sin(this.time*2)*.8:cycle*1.3,step=this.state==="idle"?0:cycle*5;const scarf=Math.sin(this.time*(this.state==="run"?18:6))* (this.state==="run"?2.8:.8);c.save();c.translate((this.x-camera.x)*z,(this.y-camera.y+bob)*z);c.scale(this.dir,1);c.imageSmoothingEnabled=false;
 c.globalAlpha=.25;c.fillStyle="#061014";c.beginPath();c.ellipse(0,22*z,18*z,6*z,0,0,Math.PI*2);c.fill();c.globalAlpha=1;
 // legs / boots
 c.fillStyle="#17242b";c.fillRect((-11+step*.35)*z,8*z,9*z,13*z);c.fillRect((2-step*.35)*z,8*z,9*z,13*z);c.fillStyle="#0d171d";c.fillRect((-13+step*.35)*z,18*z,11*z,4*z);c.fillRect((1-step*.35)*z,18*z,11*z,4*z);
 // coat and backpack
 c.fillStyle="#1a3037";c.fillRect(-15*z,-8*z,6*z,19*z);c.fillStyle=this.color;c.fillRect(-12*z,-10*z,24*z,21*z);c.fillStyle="rgba(255,255,255,.24)";c.fillRect(-9*z,-8*z,6*z,4*z);c.fillStyle="rgba(0,0,0,.22)";c.fillRect(0*z,2*z,10*z,8*z);
 // arms
 c.fillStyle="#d69a70";c.fillRect(-16*z,-2*z,5*z,11*z);c.fillRect(11*z,-2*z,5*z,11*z);c.fillStyle=this.color;c.fillRect(-17*z,-3*z,5*z,7*z);c.fillRect(12*z,-3*z,5*z,7*z);
 // scarf
 c.fillStyle=this.color;c.fillRect(8*z,0,10*z,4*z);c.save();c.translate(15*z,2*z);c.rotate(scarf*.045);c.fillRect(0,0,12*z,3*z);c.restore();
 // neck/head/hair
 c.fillStyle="#d69a70";c.fillRect(-4*z,-12*z,8*z,5*z);c.fillStyle="#ffd9ae";c.fillRect(-11*z,-28*z,22*z,18*z);c.fillStyle="#17242b";c.fillRect(-12*z,-31*z,24*z,6*z);c.fillRect(-9*z,-34*z,17*z,4*z);c.fillStyle="#263c43";c.fillRect(-11*z,-25*z,4*z,7*z);
 // face
 c.fillStyle="#fff";c.fillRect(-7*z,-21*z,5*z,5*z);c.fillRect(2*z,-21*z,5*z,5*z);c.fillStyle="#18262c";c.fillRect(-5*z,-20*z,2*z,3*z);c.fillRect(3*z,-20*z,2*z,3*z);c.fillStyle="#bd6f55";c.fillRect(-3*z,-14*z,7*z,2*z);
 // pixel highlights
 c.fillStyle="rgba(255,255,255,.35)";c.fillRect(-8*z,-27*z,5*z,2*z);c.fillRect(-9*z,-7*z,3*z,3*z);c.restore()}
}
