import {Command, Delete, Multiple, Operation, Type} from "scalable-ot-proto/gen/text_pb";

function toTextOpSingle_(op: Operation): any {
  switch (op.getType()) {
    case Type.RETAIN:
      return op.getRetain();
    case Type.INSERT:
      return op.getInsert();
    case Type.DELETE:
      const d = op.getDelete();
      if (d == null) {
        return 0;
      } else {
        return {
          d: d.getDelete(),
        };
      }
    default:
      return 0;
  }
}

export function toTextOp(op: Operation|undefined): any[] {
  if (!op) {
    return [];
  }
  if (op.getType() === Type.MULTI) {
    const multi = op.getMultiple();
    if (multi == null) {
      return [];
    }
    return multi.getOpsList().map(toTextOpSingle_);
  } else {
    return [toTextOpSingle_(op)];
  }
}

function fromTextOpSingle_(textOp: any): Operation {
  const res = new Operation();
  switch (typeof textOp) {
    case "number":
      res.setType(Type.RETAIN);
      res.setRetain(textOp);
      break;
    case "string":
      res.setType(Type.INSERT);
      res.setInsert(textOp);
      break;
    case "object":
      res.setType(Type.DELETE);
      const del = new Delete();
      del.setDelete(textOp.d);
      res.setDelete(del);
      break;
    default:
      res.setType(Type.RETAIN);
      res.setRetain(0);
      break;
  }
  return res;
}

export function fromTextOp(textOp: any[]): Operation {
  if (textOp.length === 1) {
    return fromTextOpSingle_(textOp[0]);
  }
  const res = new Operation();
  res.setType(Type.MULTI);
  const multiple = new Multiple();
  multiple.setOpsList(textOp.map(fromTextOpSingle_));
  res.setMultiple(multiple);
  return res;
}

export function fromCommandDto(dto: any): Command {
  return Command.deserializeBinary(dto.payload);
}

export function toCommandDto(command: Command): any {
  return {
    docId: command.getDocid(),
    payload: command.serializeBinary(),
    version: command.getVersion(),
  };
}
