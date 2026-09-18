export function blocked(world,x,y,r=18){
 if(x<40||y<40||x>world.w-40||y>world.h-40)return true;
 for(const t of world.trees){const rr=22*(t.s||1);if((x-t.x)**2+(y-(t.y+10))**2<(r+rr)**2)return true}
 for(const b of world.buildings){if(Math.abs(x-b.x)<32+r&&Math.abs(y-b.y)<32+r)return true}
 return false;
}
