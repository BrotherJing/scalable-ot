import { Command } from "scalable-ot-proto/gen/text_pb";
import DB from "./index";

class MemoryDB extends DB {

  public static clone(op: Command): Command {
    return Command.deserializeBinary(op.serializeBinary());
  }
  public ops: Command[];
  constructor() {
    super();
    this.ops = [];
  }

  public async getOps(from: number): Promise<Command[]> {
    const ops = this.ops.slice(from);
    return ops.map((op) => MemoryDB.clone(op));
  }

  public async commit(op: Command) {
    this.ops[op.getVersion()] = MemoryDB.clone(op);
  }
}

export default MemoryDB;
