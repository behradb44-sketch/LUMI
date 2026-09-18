export class PixelAnimator{
 constructor(){this.clips=new Map()}
 add(name,frames,fps=10){this.clips.set(name,{frames,fps})}
 frame(name,time){const c=this.clips.get(name);if(!c||!c.frames.length)return 0;return c.frames[Math.floor(time*c.fps)%c.frames.length]}
}
export function easing(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}