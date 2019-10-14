import WebSocketJSONStream from "@teamwork/websocket-json-stream";
import express from "express";
import http from "http";
import {Command, Type} from "scalable-ot-proto/gen/text_pb";
import WebSocket from "ws";
import { OT_SERVER_PORT } from "./config";

const app = express();
const server = http.createServer(app);

const wss = new WebSocket.Server({server});
wss.on("connection", (ws) => {
  ws.on("message", (chunk) => {
    const bytes = Array.prototype.slice.call(chunk);
    const command = Command.deserializeBinary(bytes);
    // tslint:disable-next-line:no-console
    console.log("received command: %s", JSON.stringify(command.toObject()));
  });
});

server.listen(OT_SERVER_PORT);
// tslint:disable-next-line:no-console
console.log(`server started at http://localhost:${OT_SERVER_PORT}`);
