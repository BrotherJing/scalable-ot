import { Command } from "scalable-ot-proto/gen/text_pb";

class DB {
  public async getOps(from: number): Promise<Command[]> {
    throw new Error();
  }

  public async commit(op: Command) {
    throw new Error();
  }
}

export default DB;
