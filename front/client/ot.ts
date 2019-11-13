import { Command, DocType, DocTypeMap } from "scalable-ot-proto/gen/base_pb";
import { fromProto, toProto } from "./util";
import { type } from "ot-text";
import { type as jsonType } from 'ot-json0';

const registry = {
  [DocType.PLAIN_TEXT]: type,
  [DocType.JSON]: jsonType,
};

export function transformX(clientCmd: Command, serverCmd: Command) {
  if (!clientCmd.getOp() || !serverCmd.getOp()) {
    return;
  }
  const type = registry[clientCmd.getType()];
  const clientOpText = fromProto(clientCmd.getOp(), clientCmd.getType());
  const serverOpText = fromProto(serverCmd.getOp(), serverCmd.getType());

  // transform client by server, server happen first
  const clientOpTextNew = type.transform(clientOpText, serverOpText, 'left');
  // transform server by client, server happen first
  const serverOpTextNew = type.transform(serverOpText, clientOpText, 'right');

  clientCmd.setOp(toProto(clientOpTextNew, clientCmd.getType()));
  serverCmd.setOp(toProto(serverOpTextNew, clientCmd.getType()));
}

export function deserializeSnapshot(data: any, docType: DocTypeMap[keyof DocTypeMap]): any {
  if (docType === DocType.JSON) {
    return JSON.parse(data);
  }
  return data;
}