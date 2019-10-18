// tslint:disable:no-console

import * as kafka from "kafka-node";
import { Command } from "scalable-ot-proto/gen/text_pb";
import {KAFKA_TOPIC_OP} from "../const/config";

class Kafka {
  private producer: kafka.Producer;
  private ready: boolean;
  private pendingOps: Command[];
  constructor() {
    const client = new kafka.KafkaClient();
    this.producer = new kafka.HighLevelProducer(client, {
      partitionerType: 3, // partitioned by key
      requireAcks: 1,
    });
    this.ready = false;
    this.pendingOps = [];
    this.bindEvents_();
  }

  public sendOp(command: Command) {
    this.pendingOps.push(command);
    if (this.ready) {
      this.sendNextOp_();
    }
  }

  private bindEvents_() {
    this.producer.on("ready", () => {
      this.ready = true;
      this.sendNextOp_();
    });

    this.producer.on("error", (err) => {
      console.log(err);
      console.log("[kafka-producer -> " + KAFKA_TOPIC_OP + "]: connection errored");
      throw err;
    });
  }

  private sendNextOp_() {
    if (this.pendingOps.length === 0) {
      return;
    }
    const op = this.pendingOps.shift();
    const payloads = [{
      key: op.getDocid(), // partitioned by document id
      messages: Buffer.from(op.serializeBinary()),
      topic: KAFKA_TOPIC_OP
    }];
    this.producer.send(payloads, (err) => {
      if (err) {
        console.log("[kafka-producer -> " + KAFKA_TOPIC_OP + "]: broker update failed");
      } else {
        console.log("[kafka-producer -> " + KAFKA_TOPIC_OP + "]: broker update success");
      }
    });
  }
}

export default Kafka;
