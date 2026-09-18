# LUMI SERVER
Render Web Service configuration:
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- PORT is read from `process.env.PORT`.

No database. All rooms, players, objectives, events, chat and temporary buildings live in RAM.
Health endpoint: GET /health
WebSocket endpoint: /ws
