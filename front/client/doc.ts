import {type} from 'ot-text';
import {Command, Operation, Snapshot} from 'scalable-ot-proto/gen/text_pb';
import { toTextOp, fromTextOp } from './util';

class Doc {
  ws: WebSocket;
  id: string;
  version: number|undefined;
  data: string|undefined;
  inflightOp: Command|undefined;
  pendingOps: Command[];
  constructor(ws: WebSocket, id: string) {
    this.ws = ws;
    this.id = id;
    this.version = undefined;
    this.data = undefined;
    this.inflightOp = undefined;
    this.pendingOps = [];
  }

  init(snapshot: Snapshot) {
    this.version = snapshot.getVersion();
    this.data = snapshot.getData();
  }

  bindEvent_() {
    this.ws.onmessage = (message) => {
      const command = Command.deserializeBinary((new Uint8Array(message.data)));
      
    };    
  }

  handleCommand_(command: Command) {
    if (this.inflightOp &&
      this.inflightOp.getSid() === command.getSid() &&
      this.inflightOp.getSeq() === command.getSeq()) {
        //TODO: ack
        return;
      }
    if (this.version == null || command.getVersion() > this.version) {
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
    this.applyCommand_(command);
  }

  applyCommand_(command: Command) {
    if (!this.data) {
      return;
    }
    this.data = type.apply(this.data, toTextOp(command.getOp()));
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
}

export default Doc;
