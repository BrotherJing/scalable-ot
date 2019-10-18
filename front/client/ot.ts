import { Command } from "scalable-ot-proto/gen/text_pb";
import { toTextOp, fromTextOp } from "./util";
import { type } from "ot-text";

export function transformX(clientCmd: Command, serverCmd: Command) {
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
