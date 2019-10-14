import EventEmitter from "events";
import { Command } from "scalable-ot-proto/gen/text_pb";
import WebSocket from "ws";
import Client from "./client";
import DB from "./db";
import MemoryDB from "./db/memory";
import Exception from "./model/exception";
import SubmitRequest from "./submit-request";

class Backend extends EventEmitter {
  public db: DB;
  public clients: Client[];
  constructor() {
    super();
    this.db = new MemoryDB();
    this.clients = [];
  }

  public listen(ws: WebSocket): Client {
    const client = new Client(this, ws);
    this.clients.push(client);
    return client;
  }

  public async submit(client: Client, command: Command, callback: (err: Exception, ops: Command[]) => void) {
    const submitRequest = new SubmitRequest(client, this, command, callback);
    await submitRequest.submit();
  }

  public sendToAll(command: Command, excludeSelf: boolean) {
    this.clients.forEach((client) => {
      if (excludeSelf && client.sid === command.getSid()) {
        return;
      }
      client.sendOp(command);
    });
  }
}

export default Backend;
