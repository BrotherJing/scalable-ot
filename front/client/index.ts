import { OT_SERVER_PORT } from "./config";

const socket = new WebSocket(`ws://localhost:${OT_SERVER_PORT}`);

socket.onmessage = (message) => {
  // tslint:disable-next-line:no-console
  console.log(`message received: ${message.data}`);
};

(window as any).socket = socket;
