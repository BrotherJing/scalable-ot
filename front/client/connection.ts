import {EventEmitter} from 'events';
import short from 'short-uuid';
import { Command } from 'scalable-ot-proto/gen/text_pb';

class Connection extends EventEmitter {
  ws: WebSocket;
  sid: string;
  seq: number;
  constructor(ws: WebSocket) {
    super();
    this.ws = ws;
    this.sid = short.generate();
    this.seq = 0;
    this.bindEvent_();
  }

  bindEvent_() {
    this.ws.onmessage = (message) => {
      const command = Command.deserializeBinary((new Uint8Array(message.data)));
      this.emit('command', command);
    };
    this.ws.onopen = () => {
      this.emit('open');
    }
  }

  sendOp(command: Command) {
    const bytes = command.serializeBinary();
    this.ws.send(bytes);
  }
}

export default Connection;
