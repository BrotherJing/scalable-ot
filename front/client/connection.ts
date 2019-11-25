import {EventEmitter} from 'events';
import short from 'short-uuid';
import { Command } from 'scalable-ot-proto/gen/base_pb';
import {
  OT_WS_SERVER_URL,
  SEND_OP_THROUGH_WS,
} from "./const/config";

class Connection extends EventEmitter {
  ws: WebSocket;
  sid: string;
  seq: number;
  open: boolean;
  constructor(address: string) {
    super();
    const ws = new WebSocket(SEND_OP_THROUGH_WS ? OT_WS_SERVER_URL : `ws://${address}/socket`);
    ws.binaryType = 'arraybuffer';
    this.ws = ws;
    this.sid = short.generate();
    this.seq = 0;
    this.open = false;
    this.bindEvent_();
  }

  bindEvent_() {
    this.ws.onmessage = (message) => {
      const command = Command.deserializeBinary((new Uint8Array(message.data)));
      this.emit('command', command);
    };
    this.ws.onopen = () => {
      this.open = true;
      this.emit('open');
    }
  }

  sendOp(command: Command) {
    const bytes = command.serializeBinary();
    this.ws.send(bytes);
  }
}

export default Connection;
