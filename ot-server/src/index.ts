import WebSocketJSONStream from "@teamwork/websocket-json-stream";
import express from "express";
import http from "http";
import WebSocket from "ws";
import { OT_SERVER_PORT } from "./config";

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({server});
wss.on("connection", (ws) => {
  const stream = new WebSocketJSONStream(ws);
  stream.on("data", (chunk) => {
    stream.write(chunk);
  });
});

server.listen(OT_SERVER_PORT);
// tslint:disable-next-line:no-console
console.log(`server started at http://localhost:${OT_SERVER_PORT}`);
