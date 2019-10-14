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
  constructor() {
    super();
    this.db = new MemoryDB();
  }

  public listen(ws: WebSocket): Client {
    const client = new Client(this, ws);
    return client;
  }

  public async submit(client: Client, command: Command, callback: (err: Exception, ops: Command[]) => void) {
    const submitRequest = new SubmitRequest(client, this, command, callback);
    await submitRequest.submit();
  }
}

export default Backend;
