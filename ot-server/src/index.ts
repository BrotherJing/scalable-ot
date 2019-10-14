import express from "express";
import http from "http";
import WebSocket from "ws";
import Backend from "./backend";
import { OT_SERVER_PORT } from "./config";

const app = express();
const server = http.createServer(app);
const backend = new Backend();

const wss = new WebSocket.Server({server});
wss.on("connection", (ws) => {
  const client = backend.listen(ws);
});

server.listen(OT_SERVER_PORT);
// tslint:disable-next-line:no-console
console.log(`server started at http://localhost:${OT_SERVER_PORT}`);
