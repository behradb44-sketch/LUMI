const PAL=["#55dce4","#ed5c62","#62d68b","#a879e8","#f0ce58","#f17fc5"];
export class Player{
 constructor(d,local=false){Object.assign(this,d);this.local=local;this.x??=0;this.y??=0;this.targetX=this.x;this.targetY=this.y;this.vx=0;this.vy=0;this.time=0;this.state="idle";this.dir=1;this.jumpT=0;this.color=this.color||PAL[this.character%PAL.length]}
 update(dt,input){this.time+=dt;if(!this.local){const dx=this.targetX-this.x,dy=this.targetY-this.y;this.x+=dx*Math.min(1,dt*15);this.y+=dy*Math.min(1,dt*15);return}
 const speed=input.run?270:155;let x=input.x,y=input.y,l=Math.hypot(x,y);if(l){x/=l;y/=l;this.vx=x*speed;this.vy=y*speed;this.state=input.run?"run":"walk";if(Math.abs(x)>.08)this.dir=x<0?-1:1}else{this.vx*=Math.pow(.0005,dt);this.vy*=Math.pow(.0005,dt);this.state="idle"}
 this.x+=this.vx*dt;this.y+=this.vy*dt;if(input.jump&&this.jumpT<=0){this.jumpT=.46;this.state="jump"}if(this.jumpT>0){this.jumpT-=dt;if(this.jumpT<=0)this.state=Math.hypot(this.vx,this.vy)>10?(input.run?"run":"walk"):"idle"}this.x=Math.max(45,Math.min(3555,this.x));this.y=Math.max(45,Math.min(2355,this.y))}
 draw(c,z,camera){const speed=this.state==="run"?15:this.state==="walk"?10:2.5;const cycle=Math.sin(this.time*speed);const bob=this.state==="idle"?Math.sin(this.time*2)*1.1:this.jumpT>0?-10+Math.abs(Math.sin(this.time*10))*3:cycle*2.2;const leg= this.state==="idle"?0:cycle*4;const scarf=this.state==="run"?Math.sin(this.time*18)*2.5:Math.sin(this.time*6)*.7;
 c.save();c.translate((this.x-camera.x)*z,(this.y-camera.y+bob)*z);c.scale(this.dir,1);c.imageSmoothingEnabled=false;
 c.globalAlpha=.28;c.fillStyle="#001014";c.beginPath();c.ellipse(0,18*z,14*z,5*z,0,0,Math.PI*2);c.fill();c.globalAlpha=1;
 // shadow/feet
 c.fillStyle="#17252b";c.fillRect((-9+leg*.25)*z,7*z,7*z,11*z);c.fillRect((2-leg*.25)*z,7*z,7*z,11*z);
 // backpack and scarf follow-through
 c.fillStyle="#263d43";c.fillRect(-13*z,(-5+scarf*.2)*z,5*z,16*z);
 c.fillStyle=this.color;c.fillRect(-10*z,-7*z,20*z,18*z);
 c.fillStyle="#d8a071";c.fillRect(-12*z,-2*z,4*z,9*z);c.fillRect(8*z,-2*z,4*z,9*z);
 c.fillStyle=this.color;c.fillRect(9*z,1*z,8*z,3*z);c.save();c.translate(9*z,1*z);c.rotate(scarf*.04);c.fillRect(0,0,10*z,3*z);c.restore();
 // head/hair
 c.fillStyle="#ffd8ac";c.fillRect(-8*z,-20*z,16*z,14*z);c.fillStyle="#17252c";c.fillRect(-9*z,-22*z,18*z,4*z);
 // eyes, tiny highlights
 c.fillStyle="#fff";c.fillRect(-5*z,-16*z,3*z,3*z);c.fillRect(2*z,-16*z,3*z,3*z);c.fillStyle="#152229";c.fillRect(-4*z,-15*z,1*z,2*z);c.fillRect(3*z,-15*z,1*z,2*z);
 c.fillStyle="#fff9d6";c.fillRect(-7*z,-8*z,3*z,2*z);c.restore()}
}