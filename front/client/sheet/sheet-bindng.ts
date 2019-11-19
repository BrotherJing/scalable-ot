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
    this.hot.addHook('beforeChange', this.onBeforeChange_);
    this.hot.addHook('beforeCreateCol', this.onBeforeCreateCol_);
    this.hot.addHook('beforeCreateRow', this.onBeforeCreateRow_);
    this.hot.addHook('beforeRemoveCol', this.onBeforeRemoveCol_);
    this.hot.addHook('beforeRemoveRow', this.onBeforeRemoveRow_);
    this.hot.addHook('beforeCut', this.onBeforeCut_);
    this.hot.addHook('beforePaste', this.onBeforePaste_);
    this.doc.on('op', this.onOp_);
  }

  onOp_ = () => {
    this.update();
  }

  update() {
    this.hot.loadData(this.doc.data);
  }

  onBeforeChange_ = (changes: Handsontable.CellChange[]|null, source: Handsontable.ChangeSource) => {
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
    return false;
  }

  onBeforeCreateCol_ = (index: number, amount: number, source?: Handsontable.ChangeSource) => {
    let ops = [] as any[];
    for (let i = 0; i < this.hot.countRows(); i++) {
      for (let j = 0; j < amount; j++) {
        ops.push({
          p: [i, index + j],
          li: '',
        });
      }
    }
    this.doc.submitOp(toProto(ops, DocType.JSON), this);
    return false;
  }

  onBeforeCreateRow_ = (index: number, amount: number, source?: Handsontable.ChangeSource) => {
    let ops = [] as any[];
    let row = [];
    for (let j = 0; j < this.hot.countCols(); j++) {
      row.push('');
    }
    for (let j = 0; j < amount; j++) {
      ops.push({
        p: [index + j],
        li: row,
      });
    }
    this.doc.submitOp(toProto(ops, DocType.JSON), this);
    return false;
  }

  onBeforeRemoveCol_ = (index: number, amount: number) => {
    let ops = [] as any[];
    for (let i = 0; i < this.hot.countRows(); i++) {
      for (let j = 0; j < amount; j++) {
        ops.push({
          p: [i, index],
          ld: '',
        });
      }
    }
    this.doc.submitOp(toProto(ops, DocType.JSON), this);
    return false;
  }

  onBeforeRemoveRow_ = (index: number, amount: number) => {
    let ops = [] as any[];
    let row = [];
    for (let j = 0; j < this.hot.countCols(); j++) {
      row.push('');
    }
    for (let j = 0; j < amount; j++) {
      ops.push({
        p: [index],
        ld: row,
      });
    }
    this.doc.submitOp(toProto(ops, DocType.JSON), this);
    return false;
  }

  onBeforeCut_ = (data: any[][], coords: Handsontable.plugins.RangeType[]) => {
    let ops = [] as any[];
    for (let coord of coords) {
      for (let i = coord.startRow; i <= coord.endRow; i++) {
        for (let j = coord.startCol; j <= coord.endCol; j++) {
          ops.push({
            p: [i, j],
            li: '',
            ld: '',
          });
        }
      }
    }
    this.doc.submitOp(toProto(ops, DocType.JSON), this);
    return true;
  }

  onBeforePaste_ = (data: any[][], coords: Handsontable.plugins.RangeType[]) => {
    let rows = this.hot.countRows();
    let cols = this.hot.countCols();
    let dataRows = data.length;
    let dataCols = data[0].length;
    let ops = [] as any[];
    for (let coord of coords) {
      let repeatX = Math.max((coord.endCol - coord.startCol + 1) / dataCols, 1);
      let repeatY = Math.max((coord.endRow - coord.startRow + 1) / dataRows, 1);
      for (let i = 0; i < repeatY; i++) {
        for (let j = 0; j < repeatX; j++) {
          for (let ii = 0; ii < dataRows; ii++) {
            let row = coord.startRow + i * dataRows + ii;
            if (row >= rows) continue;
            for (let jj = 0; jj < dataCols; jj++) {
              let col = coord.startCol + j * dataCols + jj;
              if (col >= cols) continue;
              ops.push({
                p: [row, col],
                li: data[ii][jj],
                ld: '',
              });
            }
          }
        }
      }
    }
    this.doc.submitOp(toProto(ops, DocType.JSON), this);
    return false;
  }
}

export default SheetBinding;
