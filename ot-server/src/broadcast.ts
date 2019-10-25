import {
  BroadcastRequest,
  BroadcastServiceClient,
  Command,
  grpc,
  SendRequest,
} from "scalable-ot-proto";
import WebSocket from "ws";
import Backend from "./backend";
import Client from "./client";
import { GRPC_BROADCAST_SERVICE_PORT, SEND_BROADCAST_THROUGH_WS } from "./const/config";

class Broadcast {
  public backend: Backend;
  public rpc: BroadcastServiceClient;
  private clients: {[key: string]: Client[]};
  constructor(backend: Backend) {
    this.backend = backend;
    this.clients = {};
    this.rpc = new BroadcastServiceClient(`localhost:${GRPC_BROADCAST_SERVICE_PORT}`,
      grpc.credentials.createInsecure());
  }

  /**
   * Send to specific client.
   */
  public sendTo(sid: string, commands: Command[]): Promise<any> {
    const request = new SendRequest();
    request.setSid(sid);
    request.setCommandList(commands);
    return new Promise((resolve, reject) => {
      this.rpc.sendTo(request, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Broadcast to all clients subscribed on specific docId.
   */
  public sendToAll(command: Command, excludeSelf: boolean): Promise<any> {
    if (SEND_BROADCAST_THROUGH_WS) {
      this.getClients_(command.getDocid()).forEach((client) => {
        if (excludeSelf && client.sid === command.getSid()) {
          return;
        }
        client.sendOp(command);
      });
      return;
    }

    const request = new BroadcastRequest();
    request.setCommandList([command]);
    request.setExcludeself(excludeSelf);
    return new Promise((resolve, reject) => {
      this.rpc.sendToAll(request, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * @deprecated
   */
  public listen(ws: WebSocket): Client {
    const client = new Client(this.backend, ws);
    return client;
  }

  /**
   * @deprecated
   */
  public register(docId: string, client: Client) {
    this.getClients_(docId).push(client);
  }

  private getClients_(docId: string) {
    this.clients[docId] = this.clients[docId] || [];
    return this.clients[docId];
  }
}

export default Broadcast;
