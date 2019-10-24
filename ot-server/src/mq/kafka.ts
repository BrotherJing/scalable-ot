// tslint:disable:no-console

import * as kafka from "kafka-node";
import { Command } from "scalable-ot-proto/gen/text_pb";
import Backend from "../backend";
import {KAFKA_TOPIC_OP, KAFKA_TOPIC_REVISION} from "../const/config";

class Kafka {
  private backend: Backend;
  private producer: kafka.Producer;
  private opConsumer: kafka.Consumer;
  private ready: boolean;
  private pendingOps: Command[];
  constructor(backend: Backend) {
    this.backend = backend;
    this.producer = new kafka.HighLevelProducer(new kafka.KafkaClient(), {
      partitionerType: 3, // partitioned by key
      requireAcks: 1,
    });
    this.opConsumer = new kafka.Consumer(new kafka.KafkaClient(), [{
      partition: 0,
      topic: KAFKA_TOPIC_OP,
    }, {
      partition: 1,
      topic: KAFKA_TOPIC_OP,
    }, {
      partition: 2,
      topic: KAFKA_TOPIC_OP,
    }], {
      // autoCommit: true,
      encoding: "buffer",
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
      console.log("[kafka-producer -> " + KAFKA_TOPIC_REVISION + "]: connection errored");
    });

    this.opConsumer.on("message", (message) => {
      const command = Command.deserializeBinary(message.value as Buffer);
      this.backend.submit(command, async (err, ops) => {
        const ack = new Command();
        ack.setDocid(command.getDocid());
        ack.setSeq(command.getSeq());
        ack.setSid(command.getSid());
        // version might change during ot
        ack.setVersion(command.getVersion());
        await this.backend.broadcast.sendTo(command.getSid(), ops);
        await this.backend.broadcast.sendTo(command.getSid(), [ack]);
      });
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
      topic: KAFKA_TOPIC_REVISION
    }];
    this.producer.send(payloads, (err) => {
      console.log(`[kafka-producer -> " + KAFKA_TOPIC_REVISION + "]: broker update ${err ? "failed" : "success"}`);
    });
  }
}

export default Kafka;
