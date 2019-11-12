import TextDiffBinding from "text-diff-binding";
import Doc from "./doc";
import {Any} from 'google-protobuf/google/protobuf/any_pb';
import { Operation, Type, Delete, Multiple } from "scalable-ot-proto/gen/text_pb";
import { Command } from 'scalable-ot-proto/gen/base_pb';

class StringBinding extends TextDiffBinding {
  doc: Doc;
  constructor(element: Element, doc: Doc) {
    super(element);
    this.doc = doc;
  }

  setup() {
    this.update();
    this.bindEvent_();
  }

  bindEvent_() {
    this.doc.on('op', this.onOp_);
    this.element.addEventListener('input', () => this.onInput(), false);
  }

  onOp_ = (command: Command, source: any) => {
    if (source === this) {
      return;
    }
    let op = command.getOp();
    if (!op) {
      return;
    }
    this.exec_(op.unpack(Operation.deserializeBinary, 'text.Operation'));
  }

  exec_(op: Operation|null) {
    if (!op) {
      return;
    }
    let ops;
    if (op.hasMultiple()) {
      let multiple = op.getMultiple();
      if (!multiple) {
        return;
      }
      ops = multiple.getOpsList();
    } else {
      ops = [op];
    }
    let index = 0;
    for (let op of ops) {
      switch(op.getType()) {
        case Type.RETAIN:
          index += op.getRetain();
          break;
        case Type.INSERT:
          this.onInsert(index, op.getInsert().length);
          break;
        case Type.DELETE:
          let del = op.getDelete();
          if (!del) break;
          this.onRemove(index, del.getDelete());
          break;
        default:
          break;
      }
    }
  }

  _get() {
    return this.doc.data;
  }

  _insert(index: number, text: string) {
    let ops = [];
    if (index > 0) {
      ops.push(this.createRetainOp_(index));
    }
    let op = new Operation();
    op.setType(Type.INSERT);
    op.setInsert(text);
    ops.push(op);
    this.doc.submitOp(this.generalize_(this.createMultiOp_(ops)), this);
  }

  _remove(index: number, text: string) {
    let ops = [];
    if (index > 0) {
      ops.push(this.createRetainOp_(index));
    }
    let op = new Operation();
    op.setType(Type.DELETE);
    let del = new Delete();
    del.setDelete(text.length);
    op.setDelete(del);
    ops.push(op);
    this.doc.submitOp(this.generalize_(this.createMultiOp_(ops)), this);
  }

  createRetainOp_(index: number): Operation {
    let res = new Operation();
    res.setType(Type.RETAIN);
    res.setRetain(index);
    return res;
  }

  createMultiOp_(ops: Operation[]): Operation {
    if (ops.length === 1) {
      return ops[0];
    }
    let res = new Operation();
    res.setType(Type.MULTI);
    let multi = new Multiple();
    multi.setOpsList(ops);
    res.setMultiple(multi);
    return res;
  }

  generalize_(op: Operation): Any {
    let any = new Any();
    any.pack(op.serializeBinary(), 'text.Operation');
    return any;
  }
}

export default StringBinding;
