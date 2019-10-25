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
  constructor() {
    super();
    this.db = new MongoDB();
    this.mq = new Kafka(this);
    this.broadcast = new Broadcast(this);
    this.submitQueue = new SubmitQueue();
  }

  public listen(ws: WebSocket): Client {
    return this.broadcast.listen(ws);
  }

  public register(docId: string, client: Client) {
    this.broadcast.register(docId, client);
  }

  public submit(command: Command, callback?: (err: Exception, ops: Command[]) => void) {
    this.submitQueue.submit(command.getDocid(), new SubmitRequest(this, command, callback));
  }

  public sendToAll(command: Command, excludeSelf: boolean) {
    this.broadcast.sendToAll(command, excludeSelf);
  }
}

export default Backend;
