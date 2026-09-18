const PAL=["#55dce4","#ed5c62","#62d68b","#a879e8","#f0ce58","#f17fc5"];
export class Player{
 constructor(d,local=false){Object.assign(this,d);this.local=local;this.x??=0;this.y??=0;this.targetX=this.x;this.targetY=this.y;this.vx=0;this.vy=0;this.time=0;this.state=d.state||"idle";this.dir=1;this.jumpT=0;this.color=d.color||PAL[(Number(d.character)||0)%PAL.length]}
 update(dt,input,world){this.time+=dt;if(!this.local){const dx=this.targetX-this.x,dy=this.targetY-this.y;this.x+=dx*Math.min(1,dt*14);this.y+=dy*Math.min(1,dt*14);return}
 const speed=input.run?275:165;let x=input.x,y=input.y,l=Math.hypot(x,y);if(l){x/=l;y/=l;this.vx=x*speed;this.vy=y*speed;this.state=input.run?"run":"walk";if(Math.abs(x)>.08)this.dir=x<0?-1:1}else{this.vx*=Math.pow(.0001,dt);this.vy*=Math.pow(.0001,dt);this.state="idle"}
 const nx=this.x+this.vx*dt,ny=this.y+this.vy*dt;
 if(!world||!world.blocked?.(nx,ny)){this.x=nx;this.y=ny}else{if(!world.blocked?.(nx,this.y))this.x=nx;if(!world.blocked?.(this.x,ny))this.y=ny}
 if(input.jump&&this.jumpT<=0){this.jumpT=.46;this.state="jump"}if(this.jumpT>0){this.jumpT-=dt;if(this.jumpT<=0)this.state=l?(input.run?"run":"walk"):"idle"}
 this.x=Math.max(45,Math.min(3555,this.x));this.y=Math.max(45,Math.min(2355,this.y))}
 draw(c,z,camera){const cycle=Math.sin(this.time*(this.state==="run"?15:this.state==="walk"?10:2.5));const bob=this.state==="idle"?Math.sin(this.time*2)*1.2:this.jumpT>0?-10+Math.abs(Math.sin(this.time*10))*3:cycle*2;const leg=this.state==="idle"?0:cycle*5;const scarf=this.state==="run"?Math.sin(this.time*18)*3:Math.sin(this.time*6);
 c.save();c.translate((this.x-camera.x)*z,(this.y-camera.y+bob)*z);c.scale(this.dir,1);c.imageSmoothingEnabled=false;
 c.globalAlpha=.3;c.fillStyle="#001014";c.beginPath();c.ellipse(0,18*z,18*z,6*z,0,0,Math.PI*2);c.fill();c.globalAlpha=1;
 // boots
 c.fillStyle="#18252b";c.fillRect((-10+leg*.25)*z,7*z,8*z,11*z);c.fillRect((2-leg*.25)*z,7*z,8*z,11*z);
 // backpack
 c.fillStyle="#20363e";c.fillRect(-15*z,-7*z,6*z,17*z);c.fillStyle="#34545c";c.fillRect(-16*z,-5*z,4*z,10*z);
 // body jacket + highlight
 c.fillStyle=this.color;c.fillRect(-11*z,-8*z,22*z,18*z);c.fillStyle="rgba(255,255,255,.22)";c.fillRect(-8*z,-7*z,5*z,3*z);
 // arms
 c.fillStyle="#d8a071";c.fillRect(-14*z,-2*z,4*z,9*z);c.fillRect(10*z,-2*z,4*z,9*z);
 // scarf
 c.fillStyle=this.color;c.fillRect(8*z,1*z,9*z,4*z);c.save();c.translate(15*z,3*z);c.rotate(scarf*.04);c.fillRect(0,0,11*z,3*z);c.restore();
 // head, hair, face
 c.fillStyle="#ffd8ac";c.fillRect(-9*z,-21*z,18*z,15*z);c.fillStyle="#18232a";c.fillRect(-10*z,-23*z,20*z,5*z);c.fillRect(-8*z,-25*z,13*z,3*z);
 c.fillStyle="#fff";c.fillRect(-6*z,-16*z,4*z,4*z);c.fillRect(2*z,-16*z,4*z,4*z);c.fillStyle="#172229";c.fillRect(-4*z,-15*z,2*z,3*z);c.fillRect(3*z,-15*z,2*z,3*z);
 c.fillStyle="#b86e54";c.fillRect(-2*z,-10*z,5*z,2*z);
 c.restore()}
}
