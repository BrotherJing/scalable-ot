import {type} from "ot-text";
import { Command } from "scalable-ot-proto/gen/text_pb";
import { fromTextOp, toTextOp } from "./util";

export function transform(op: Command, appliedOp: Command) {
  const transformedOp = type.transform(toTextOp(op.getOp()), toTextOp(appliedOp.getOp()), "left");
  op.setOp(fromTextOp(transformedOp));
  // increment version
  op.setVersion(op.getVersion() + 1);
}
