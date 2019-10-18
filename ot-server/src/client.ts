import { Command } from "scalable-ot-proto/gen/text_pb";
import WebSocket from "ws";
import Backend from "./backend";

class Client {
  public backend: Backend;
  public ws: WebSocket;
  public sid: string;
  public docId: string;
  constructor(backend: Backend, ws: WebSocket) {
    this.backend = backend;
    this.ws = ws;
    this.bindEvent_();
  }

  public bindEvent_() {
    this.ws.on("message", (data) => {
      const bytes = Array.prototype.slice.call(data);
      const command = Command.deserializeBinary(bytes);
      if (command.getInit()) {
        this.handleInit_(command);
      } else {
        this.handleCommand_(command);
      }
    });
  }

  public handleCommand_(command: Command) {
    if (!this.sid) {
      this.sid = command.getSid();
    }
    this.backend.submit(command, (err, ops) => {
      if (err) {
        return;
      }
      const ack = new Command();
      ack.setDocid(command.getDocid());
      ack.setSeq(command.getSeq());
      ack.setSid(command.getSid());
      // version might change during ot
      ack.setVersion(command.getVersion());
      this.sendOps_(ops);
      this.sendOp(ack);
    });
  }

  public sendOps_(ops: Command[]) {
    for (const op of ops) {
      this.sendOp(op);
    }
  }

  public sendOp(command: Command) {
    this.ws.send(command.serializeBinary());
  }

  private handleInit_(command: Command) {
    this.docId = command.getDocid();
    this.sid = command.getSid();

    this.backend.register(this.docId, this);
  }
}

export default Client;
