import { Command } from "scalable-ot-proto";
import Backend from "./backend";
import Exception from "./model/exception";
import {transform} from "./ot";

class SubmitRequest {
  public backend: Backend;
  public command: Command;
  public callback?: (err: Exception, ops: Command[]) => void;
  constructor(backend: Backend, command: Command,
              callback?: (err: Exception, ops: Command[]) => void) {
      this.backend = backend;
      this.command = command;
      this.callback = callback;
  }

  public async submit() {
    const docId = this.command.getDocid();
    const conflicts = await this.backend.db.getOps(docId, this.command.getVersion());
    if (conflicts.length > 0) {
      // transform command by ops before apply
      for (const conflict of conflicts) {
        transform(this.command, conflict);
      }
    }
    await this.apply();
    if (this.callback) {
      this.callback(undefined, conflicts);
    }
  }

  public async apply() {
    // broadcast
    this.backend.sendToAll(this.command, true);

    // TODO: replace with db change stream
    this.backend.mq.sendOp(this.command);

    // store revision
    await this.backend.db.commit(this.command);
  }
}

export default SubmitRequest;
