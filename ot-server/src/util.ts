import {Any} from "google-protobuf/google/protobuf/any_pb";
import { DocType, DocTypeMap } from "scalable-ot-proto/gen/base_pb";
import {
  Operation as JsonOperation,
  Operations as JsonOperations,
  Path,
  Payload,
} from "scalable-ot-proto/gen/json_pb";
import {Delete, Multiple, Operation, Type} from "scalable-ot-proto/gen/text_pb";

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

function toTextOp_(op: Operation|null): any[] {
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

function fromTextOp_(textOp: any[]): Operation {
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

function unwrapPayload_(payload: Payload): number|string|object {
  if (payload.hasNumber()) {
    return payload.getNumber();
  } else if (payload.hasText()) {
    return payload.getText();
  }
  return JSON.parse(payload.getJson());
}

function wrapPayload_(payload: any): Payload {
  const res = new Payload();
  if (typeof payload === "number") {
    res.setNumber(payload);
  } else if (typeof payload === "string") {
    res.setText(payload);
  } else {
    res.setJson(JSON.stringify(payload));
  }
  return res;
}

function toJsonOp_(ops: JsonOperations|null): any[] {
  if (!ops) {
    return [];
  }
  return ops.getOpsList().map((op) => {
    const res = {} as any;
    res.p = op.getPathList().map((p) => {
      return p.hasIndex() ? p.getIndex() : p.getKey();
    });
    if (op.hasLi()) {
      res.li = unwrapPayload_(op.getLi()!);
    }
    if (op.hasLd()) {
      res.ld = unwrapPayload_(op.getLd()!);
    }
    if (op.hasOi()) {
      res.oi = unwrapPayload_(op.getOi()!);
    }
    if (op.hasOd()) {
      res.od = unwrapPayload_(op.getOd()!);
    }
    return res;
  });
}

function fromJsonOp_(ops: any[]): JsonOperations {
  const opsList = ops.map((op) => {
    const jsonOp = new JsonOperation();
    jsonOp.setPathList((op.p || []).map((p: string|number) => {
      const path = new Path();
      if (typeof p === "number") {
        path.setIndex(p);
      } else {
        path.setKey(p);
      }
      return path;
    }));
    if (op.li != null) {
      jsonOp.setLi(wrapPayload_(op.li));
    }
    if (op.ld != null) {
      jsonOp.setLd(wrapPayload_(op.ld));
    }
    if (op.oi != null) {
      jsonOp.setOi(wrapPayload_(op.oi));
    }
    if (op.od != null) {
      jsonOp.setOd(wrapPayload_(op.od));
    }
    return jsonOp;
  });
  const jsonOps = new JsonOperations();
  jsonOps.setOpsList(opsList);
  return jsonOps;
}

export function fromProto(op: Any|undefined, docType: DocTypeMap[keyof DocTypeMap]): any[] {
  if (!op) {
    return [];
  }
  if (docType === DocType.PLAIN_TEXT) {
    return toTextOp_(op.unpack(Operation.deserializeBinary, "text.Operation"));
  } else if (docType === DocType.JSON) {
    return toJsonOp_(op.unpack(JsonOperations.deserializeBinary, "json.Operations"));
  }
  return [];
}

export function toProto(ops: any[], docType: DocTypeMap[keyof DocTypeMap]): Any {
  const proto = new Any();
  if (docType === DocType.PLAIN_TEXT) {
    proto.pack(fromTextOp_(ops).serializeBinary(), "text.Operation");
  } else if (docType === DocType.JSON) {
    proto.pack(fromJsonOp_(ops).serializeBinary(), "json.Operations");
  }
  return proto;
}
