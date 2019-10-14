import { Command } from "scalable-ot-proto/gen/text_pb";
import Backend from "./backend";
import Client from "./client";
import Exception from "./model/exception";
import {transform} from "./ot";

class SubmitRequest {
  public client: Client;
  public backend: Backend;
  public command: Command;
  public callback: (err: Exception, ops: Command[]) => void;
  constructor(client: Client, backend: Backend, command: Command,
              callback: (err: Exception, ops: Command[]) => void) {
      this.client = client;
      this.backend = backend;
      this.command = command;
      this.callback = callback;
  }

  public async submit() {
    const conflicts = await this.backend.db.getOps(this.command.getVersion());
    if (conflicts.length > 0) {
      // transform command by ops before apply
      for (const conflict of conflicts) {
        transform(this.command, conflict);
      }
    }
    await this.apply();
    this.callback(undefined, conflicts);
  }

  public async apply() {
    // broadcast
    this.backend.sendToAll(this.command, true);

    // TODO: apply to snapshot

    // store op and snapshot
    await this.backend.db.commit(this.command);
  }
}

export default SubmitRequest;
