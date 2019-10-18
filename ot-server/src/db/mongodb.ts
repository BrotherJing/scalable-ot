// tslint:disable:no-console

import {Binary, Db, MongoClient} from "mongodb";
import { Command } from "scalable-ot-proto/gen/text_pb";
import DB from ".";
import { DB_NAME, MONGODB_PORT } from "../const/config";

/**
 * The collection name, mapped from java dto class name.
 */
const COLLECTION_NAME_OP = "commandDto";

class MongoDB extends DB {
  public client: MongoClient;
  public db: Db;
  public connectPromise: Promise<any>;
  constructor() {
    super();
    this.connectPromise = MongoClient.connect(`mongodb://localhost:${MONGODB_PORT}`).then((client) => {
      console.info("mongodb connected");
      this.client = client;
      this.db = client.db(DB_NAME);
    });
  }

  public async getOps(docId: string, from: number): Promise<Command[]> {
    await this.connectPromise;
    const collection = this.db.collection(COLLECTION_NAME_OP);
    const ops = await collection.find({
      docId,
      version: {
        $gte: from,
      }
    }).toArray();
    return ops.map((op) => fromCommandDto(op));
  }

  public async commit(op: Command) {
    await this.connectPromise;
    const collection = this.db.collection(COLLECTION_NAME_OP);
    await collection.insertOne(toCommandDto(op));
  }
}

function fromCommandDto(dto: any): Command {
  return Command.deserializeBinary(dto.payload);
}

function toCommandDto(command: Command): any {
  return {
    docId: command.getDocid(),
    payload: new Binary(Buffer.from(command.serializeBinary())),
    version: command.getVersion(),
  };
}

export default MongoDB;
