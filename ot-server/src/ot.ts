import {type as jsonType} from "ot-json0";
import {type as textType} from "ot-text";
import { Command, DocType } from "scalable-ot-proto";
import { fromProto, toProto } from "./util";

const registry = {
  [DocType.PLAIN_TEXT]: textType,
  [DocType.JSON]: jsonType,
};

export function transform(op: Command, appliedOp: Command) {
  const type = registry[op.getType()];
  const transformedOp = type.transform(fromProto(op.getOp(), op.getType()),
    fromProto(appliedOp.getOp(), appliedOp.getType()), "left");
  op.setOp(toProto(transformedOp, op.getType()));
  // increment version
  op.setVersion(op.getVersion() + 1);
}
