import { Command } from "scalable-ot-proto/gen/text_pb";
import WebSocket from "ws";
import Backend from "./backend";

class Client {
  public backend: Backend;
  public ws: WebSocket;
  constructor(backend: Backend, ws: WebSocket) {
    this.backend = backend;
    this.ws = ws;
    this.bindEvent_();
  }

  public bindEvent_() {
    this.ws.on("message", (data) => {
      const bytes = Array.prototype.slice.call(data);
      const command = Command.deserializeBinary(bytes);
      this.handleCommand_(command);
    });
  }

  public handleCommand_(command: Command) {
    this.backend.submit(this, command, (err, ops) => {
      if (err) {
        return;
      }
      const ack = new Command();
      ack.setSeq(command.getSeq());
      ack.setSid(command.getSid());
      // version might change
      ack.setVersion(command.getVersion());
      this.sendOps_(ops);
      this.sendOp_(ack);
    });
  }

  public sendOps_(ops: Command[]) {
    for (const op of ops) {
      this.sendOp_(op);
    }
  }

  public sendOp_(command: Command) {
    this.ws.send(command.serializeBinary());
  }
}

export default Client;
