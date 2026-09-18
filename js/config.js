export const CONFIG={
 BACKEND_HTTP: location.origin,
 BACKEND_WS: (location.protocol==="https:"?"wss:":"ws:")+"//"+location.host,
 MAX_PLAYERS:20,
 TICK_RATE:20,
 INPUT_RATE:20,
 WORLD:{w:3600,h:2400},
 VOICE:{stun:"stun:stun.l.google.com:19302"}
};
