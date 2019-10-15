import {type} from 'ot-text';
import {Command, Operation, Snapshot} from 'scalable-ot-proto/gen/text_pb';
import { toTextOp, fromTextOp } from './util';
import {EventEmitter} from 'events';
import Connection from './connection';

class Doc extends EventEmitter {
  connection: Connection;
  id: string;
  version: number;
  data: string|undefined;
  inflightOp: Command|undefined;
  pendingOps: Command[];
  constructor(connection: Connection, id: string) {
    super();
    this.connection = connection;
    this.id = id;
    this.version = 0;
    this.data = undefined;
    this.inflightOp = undefined;
    this.pendingOps = [];
  }

  init(snapshot: Snapshot) {
    this.version = snapshot.getVersion();
    this.data = snapshot.getData();
    this.bindEvent_();
  }

  bindEvent_() {
    this.connection.on('command', (command) => {
      this.handleCommand_(command);
    });
    this.connection.on('open', () => {
      this.sendInit_();
    })
  }

  handleCommand_(command: Command) {
    if (this.inflightOp &&
      this.inflightOp.getSid() === command.getSid() &&
      this.inflightOp.getSeq() === command.getSeq()) {
        this.acknowledgeOp_(command);
        return;
      }
    if (command.getVersion() > this.version) {
      //TODO: catch up
      return;
    }
    if (command.getVersion() < this.version) {
      // ignore old operation
      return;
    }
    if (this.inflightOp) {
      Doc.transformX(this.inflightOp, command);
    }
    for (let i = 0; i < this.pendingOps.length; i++) {
      Doc.transformX(this.pendingOps[i], command);
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
    if (this.pendingOps.length === 0 || this.inflightOp) {
      return;
    }
    this.inflightOp = this.pendingOps.shift();
    let op = this.inflightOp;
    if (!op) {
      return;
    }
    if (op.getSeq() === 0) {
      op.setSeq(this.connection.seq++);
    }
    op.setDocid(this.id);
    op.setSid(this.connection.sid);
    op.setVersion(this.version);
    this.connection.sendOp(op);
  }

  applyCommand_(command: Command, source: any) {
    if (this.data == null) {
      return;
    }
    this.data = type.apply(this.data, toTextOp(command.getOp()));
    this.emit('op', command, source);
  }

  static transformX(clientCmd: Command, serverCmd: Command) {
    if (!clientCmd.getOp() || !serverCmd.getOp()) {
      return;
    }
    const clientOpText = toTextOp(clientCmd.getOp());
    const serverOpText = toTextOp(serverCmd.getOp());

    // transform client by server, server happen first
    const clientOpTextNew = type.transform(clientOpText, serverOpText, 'left');
    // transform server by client, server happen first
    const serverOpTextNew = type.transform(serverOpText, clientOpText, 'right');

    clientCmd.setOp(fromTextOp(clientOpTextNew));
    serverCmd.setOp(fromTextOp(serverOpTextNew));
  }

  submitOp(op: Operation, source: any) {
    if (!source) {
      source = true;
    }
    let command = new Command();
    command.setOp(fromTextOp(type.normalize(toTextOp(op))));
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
    last.setOp(fromTextOp(type.compose(toTextOp(last.getOp()), toTextOp(command.getOp()))));
    return true;
  }

  /**
   * When connection open, send init message in order to
   * receive broadcast message for this document.
   */
  private sendInit_() {
    let command = new Command();
    command.setInit(true);
    command.setDocid(this.id);
    command.setSid(this.connection.sid);
    this.connection.sendOp(command);
  }
}

export default Doc;
