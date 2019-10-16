import EventEmitter from "events";
import { Command } from "scalable-ot-proto/gen/text_pb";
import WebSocket from "ws";
import Client from "./client";
import DB from "./db";
import Kafka from "./db/kafka";
import MemoryDB from "./db/memory";
import Exception from "./model/exception";
import SubmitQueue from "./submit-queue";
import SubmitRequest from "./submit-request";

class Backend extends EventEmitter {
  public db: DB;
  public mq: Kafka;
  public submitQueue: SubmitQueue;
  public clients: {[key: string]: Client[]};
  constructor() {
    super();
    this.db = new MemoryDB();
    this.mq = new Kafka();
    this.submitQueue = new SubmitQueue();
    this.clients = {};
  }

  public listen(ws: WebSocket): Client {
    const client = new Client(this, ws);
    return client;
  }

  public register(docId: string, client: Client) {
    this.getClients_(docId).push(client);
  }

  public submit(client: Client, command: Command, callback: (err: Exception, ops: Command[]) => void) {
    this.submitQueue.submit(command.getDocid(), new SubmitRequest(client, this, command, callback));
  }

  public sendToAll(command: Command, excludeSelf: boolean) {
    this.getClients_(command.getDocid()).forEach((client) => {
      if (excludeSelf && client.sid === command.getSid()) {
        return;
      }
      client.sendOp(command);
    });
  }

  private getClients_(docId: string) {
    this.clients[docId] = this.clients[docId] || [];
    return this.clients[docId];
  }
}

export default Backend;
