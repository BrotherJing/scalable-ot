import {
  BroadcastRequest,
  BroadcastServiceClient as Client,
  Command,
  grpc,
  SendRequest,
} from "scalable-ot-proto";
import { GRPC_BROADCAST_SERVICE_PORT } from "./const/config";

class Broadcast {
  public client: Client;
  constructor() {
    this.client = new Client(`localhost:${GRPC_BROADCAST_SERVICE_PORT}`, grpc.credentials.createInsecure());
  }

  public sendTo(sid: string, commands: Command[]): Promise<any> {
    const request = new SendRequest();
    request.setSid(sid);
    request.setCommandList(commands);
    return new Promise((resolve, reject) => {
      this.client.sendTo(request, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public sendToAll(commands: Command[], excludeSelf: boolean): Promise<any> {
    const request = new BroadcastRequest();
    request.setCommandList(commands);
    request.setExcludeself(excludeSelf);
    return new Promise((resolve, reject) => {
      this.client.sendToAll(request, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export default Broadcast;
