const ORIGIN=location.origin;
const IS_GH=location.hostname.endsWith('.github.io');
const RENDER_BACKEND='https://lumi-n6lz.onrender.com';
export const CONFIG={BACKEND_HTTP:IS_GH?RENDER_BACKEND:ORIGIN,BACKEND_WS:(IS_GH?'wss://lumi-n6lz.onrender.com':location.protocol==='https:'?'wss://'+location.host:'ws://'+location.host),MAX_PLAYERS:20,TICK_RATE:20,INPUT_RATE:20,WORLD:{w:3600,h:2400},VOICE:{stun:'stun:stun.l.google.com:19302'}};
