import Doc from "../doc";
import Handsontable from "handsontable";
import { toProto } from '../util';
import { DocType } from "scalable-ot-proto/gen/base_pb";

class SheetBinding {
  doc: Doc;
  hot: Handsontable;

  constructor(doc: Doc, hot: Handsontable) {
    this.doc = doc;
    this.hot = hot;
  }

  setup() {
    this.update();
    this.bindEvent_();
  }

  bindEvent_() {
    this.hot.addHook('afterChange', this.onAfterChange_);
    this.doc.on('op', this.onOp_);
  }

  onOp_ = () => {
    this.update();
  }

  update() {
    this.hot.loadData(this.doc.data);
  }

  onAfterChange_ = (changes: Handsontable.CellChange[]|null, source: Handsontable.ChangeSource) => {
    if (source !== 'edit') {
      return;
    }
    let ops = [] as any[];
    changes!.forEach(([row, prop, oldVal, newVal]) => {
      if (newVal == null) {
        newVal = "";
      }
      if (oldVal == null) {
        oldVal = "";
      }
      ops.push({
        p: [row, prop],
        li: newVal,
        ld: oldVal,
      });
      console.info(`row ${row} prop ${prop}: ${oldVal} -> ${newVal}`);
    });
    this.doc.submitOp(toProto(ops, DocType.JSON), this);
  }
}

export default SheetBinding;
