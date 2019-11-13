// tslint:disable:no-console

import {type} from 'ot-text';
import {Command, DocTypeMap} from 'scalable-ot-proto/gen/base_pb';
import {Any} from 'google-protobuf/google/protobuf/any_pb';
import { fromProto, toProto } from './util';
import {EventEmitter} from 'events';
import Connection from './connection';
import IO from './io';
import { transformX, deserializeSnapshot } from './ot';
import { SEND_OP_THROUGH_WS } from './const/config';

class Doc extends EventEmitter {
  connection: Connection;
  type: DocTypeMap[keyof DocTypeMap];
  id: string|undefined;
  version: number;
  readOnly: boolean;
  data: any;
  inflightOp: Command|undefined;
  pendingOps: Command[];
  constructor(connection: Connection, type: DocTypeMap[keyof DocTypeMap], id?: string, version?: string) {
    super();
    this.connection = connection;
    this.type = type;
    this.id = id;
    this.version = version ? Number(version) : 0;
    this.readOnly = version !== undefined;
    this.data = undefined;
    this.inflightOp = undefined;
    this.pendingOps = [];
  }

  /**
   * Fetch document snapshot or create new document,
   * then send init command.
   */
  async init() {
    let snapshot;
    if (this.id) {
      snapshot = await IO.getInstance().fetch(this.id, this.readOnly ? this.version : undefined);
    } else {
      snapshot = await IO.getInstance().create(this.type);
    }
    console.info('received snapshot: %s', JSON.stringify(snapshot.toObject()));

    this.id = snapshot.getDocid();
    this.version = snapshot.getVersion();
    this.data = deserializeSnapshot(snapshot.getData(), this.type);

    this.initConnection_();
  }

  /**
   * Bind listener to message from connection, and
   * send init command.
   */
  initConnection_() {
    if (this.readOnly) {
      return;
    }
    this.connection.on('command', (command) => {
      this.handleCommand_(command);
    });
    if (this.connection.open) {
      this.sendInitCommand_();
    } else {
      this.connection.on('open', () => {
        this.sendInitCommand_();
      });
    }
  }

  handleCommand_(command: Command) {
    if (this.inflightOp &&
      this.inflightOp.getSid() === command.getSid() &&
      this.inflightOp.getSeq() === command.getSeq()) {
        this.acknowledgeOp_(command);
        return;
      }
    if (command.getVersion() > this.version) {
      console.info('receive higher version. Need to catch up');
      this.catchUp_();
      return;
    }
    if (command.getVersion() < this.version) {
      // ignore old operation
      return;
    }
    if (this.inflightOp) {
      transformX(this.inflightOp, command);
    }
    for (let i = 0; i < this.pendingOps.length; i++) {
      transformX(this.pendingOps[i], command);
    }
    this.version++;
    this.applyCommand_(command, false);
  }

  acknowledgeOp_(command: Command) {
    this.version++;
    this.inflightOp = undefined;
    this.sendNextCommand_();
  }

  sendNextCommand_() {
    if (!this.id) {
      // doc not initialized
      return;
    }
    if (this.pendingOps.length === 0 || this.inflightOp) {
      // nothing to send
      return;
    }
    this.inflightOp = this.pendingOps.shift() as Command;
    let op = this.inflightOp;
    if (op.getSeq() === 0) {
      op.setSeq(this.connection.seq++);
    }
    op.setDocid(this.id);
    op.setSid(this.connection.sid);
    op.setVersion(this.version);

    if (SEND_OP_THROUGH_WS) {
      this.connection.sendOp(op);
    } else {
      IO.getInstance().save(this.id, op);
    }
  }

  applyCommand_(command: Command, source: any) {
    if (this.data == null) {
      return;
    }
    this.data = type.apply(this.data, fromProto(command.getOp(), this.type));
    this.emit('op', command, source);
  }

  submitOp(op: Any, source: any) {
    if (!source) {
      source = true;
    }
    let command = new Command();
    command.setOp(toProto(type.normalize(fromProto(op, this.type)), this.type));
    if (this.tryCompose_(command)) {
      this.applyCommand_(command, source);
      return;
    }
    this.pendingOps.push(command);
    setTimeout(() => {
      this.sendNextCommand_();
    }, 0);
    this.applyCommand_(command, source);
  }

  tryCompose_(command: Command): boolean {
    let last = this.pendingOps[this.pendingOps.length - 1];
    if (!last) {
      return false;
    }
    last.setOp(toProto(type.compose(
      fromProto(last.getOp(), this.type),
      fromProto(command.getOp(), this.type)), this.type));
    return true;
  }

  /**
   * When connection open, send init message in order to
   * receive broadcast message for this document.
   */
  private sendInitCommand_() {
    if (!this.id) {
      return;
    }
    let command = new Command();
    command.setInit(true);
    command.setDocid(this.id);
    command.setSid(this.connection.sid);
    this.connection.sendOp(command);
  }

  /**
   * Fetch missing commands and handle them in sequence.
   */
  private async catchUp_() {
    let commands = await IO.getInstance().getOpsSince(this.id as string, this.version);
    for (let command of commands.getCommandsList()) {
      this.handleCommand_(command);
    }
  }
}

export default Doc;
