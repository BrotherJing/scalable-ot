// tslint:disable:no-console
import {Command} from "scalable-ot-proto/gen/text_pb";
import { OT_SERVER_PORT } from "./config";

const socket = new WebSocket(`ws://localhost:${OT_SERVER_PORT}`);
socket.binaryType = 'arraybuffer';

socket.onmessage = (message) => {
  const command = Command.deserializeBinary((new Uint8Array(message.data)));
  console.log(JSON.stringify(command.toObject()));
};

(window as any).socket = socket;
