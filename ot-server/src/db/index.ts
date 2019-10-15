import { Command } from "scalable-ot-proto/gen/text_pb";

class DB {
  public async getOps(docId: string, from: number): Promise<Command[]> {
    throw new Error();
  }

  public async commit(op: Command) {
    throw new Error();
  }
}

export default DB;
