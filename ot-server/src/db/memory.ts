import { Command } from "scalable-ot-proto";
import DB from "./index";

class MemoryDB extends DB {

  public static clone(op: Command): Command {
    return Command.deserializeBinary(op.serializeBinary());
  }
  public ops: {[key: string]: Command[]};
  constructor() {
    super();
    this.ops = {};
  }

  public async getOps(docId: string, from: number): Promise<Command[]> {
    const ops = this.getOps_(docId).slice(from);
    return ops.map((op) => MemoryDB.clone(op));
  }

  public async commit(op: Command) {
    this.getOps_(op.getDocid())[op.getVersion()] = MemoryDB.clone(op);
  }

  private getOps_(docId: string): Command[] {
    this.ops[docId] = this.ops[docId] || [];
    return this.ops[docId];
  }
}

export default MemoryDB;
