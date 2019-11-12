// tslint:disable:no-console

import * as kafka from "kafka-node";
import { Command } from "scalable-ot-proto";
import Backend from "../backend";
import {KAFKA_TOPIC_OP, KAFKA_TOPIC_REVISION} from "../const/config";

class Kafka {
  private backend: Backend;
  private producer: kafka.Producer;
  private opConsumer: kafka.ConsumerGroup;
  private ready: boolean;
  private pendingOps: Command[];
  constructor(backend: Backend) {
    this.backend = backend;
    this.producer = new kafka.HighLevelProducer(new kafka.KafkaClient(), {
      partitionerType: 3, // partitioned by key
      requireAcks: 1,
    });
    this.opConsumer = new kafka.ConsumerGroup({
      autoCommit: false,
      encoding: "buffer",
      fromOffset: "latest",
      groupId: "OpConsumerGroup",
    }, [KAFKA_TOPIC_OP]);
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
      console.log(`[kafka-consumer -> ${KAFKA_TOPIC_OP}]: received ${command.getVersion()}`);
      this.backend.submit(command, async (err, ops) => {
        this.opConsumer.commit((e) => {
          console.log(`[kafka-consumer -> ${KAFKA_TOPIC_OP}]: commit ${command.getVersion()} ${e ? "failed" : "success"}`);
        });
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
      console.log(`[kafka-producer -> ${KAFKA_TOPIC_REVISION}]: send ${op.getVersion()} ${err ? "failed" : "success"}`);
    });
  }
}

export default Kafka;
