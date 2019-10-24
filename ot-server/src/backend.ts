import EventEmitter from "events";
import { Command } from "scalable-ot-proto/gen/text_pb";
import WebSocket from "ws";
import Broadcast from "./broadcast";
import Client from "./client";
import DB from "./db";
import MemoryDB from "./db/memory";
import MongoDB from "./db/mongodb";
import Exception from "./model/exception";
import Kafka from "./mq/kafka";
import SubmitQueue from "./submit-queue";
import SubmitRequest from "./submit-request";

class Backend extends EventEmitter {
  public db: DB;
  public mq: Kafka;
  public broadcast: Broadcast;
  public submitQueue: SubmitQueue;
  public clients: {[key: string]: Client[]};
  constructor() {
    super();
    this.db = new MongoDB();
    this.mq = new Kafka(this);
    this.broadcast = new Broadcast();
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

  public submit(command: Command, callback?: (err: Exception, ops: Command[]) => void) {
    this.submitQueue.submit(command.getDocid(), new SubmitRequest(this, command, callback));
  }

  public sendToAll(command: Command, excludeSelf: boolean) {
    this.getClients_(command.getDocid()).forEach((client) => {
      if (excludeSelf && client.sid === command.getSid()) {
        return;
      }
      client.sendOp(command);
    });

    this.broadcast.sendToAll([command], excludeSelf);
  }

  private getClients_(docId: string) {
    this.clients[docId] = this.clients[docId] || [];
    return this.clients[docId];
  }
}

export default Backend;
