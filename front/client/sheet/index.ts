import Handsontable from "handsontable";
import 'handsontable/dist/handsontable.full.css';
import Connection from "../connection";
import Doc from "../doc";
import { DocType } from "scalable-ot-proto/gen/base_pb";
import SheetBinding from "./sheet-bindng";

const connection = new Connection();
let url = new URL(document.URL);
const doc = new Doc(connection,
  DocType.JSON,
  url.searchParams.get('docId') || undefined,
  url.searchParams.get('version') || undefined);

doc.init().then(() => {
  url.searchParams.set('docId', doc.id as string);
  window.history.replaceState(null, 'doc', url.toString());
  bindSheet();
}).catch(e => {
  console.error(e);
});

const container = document.getElementById('sheet') as Element;
const hot = new Handsontable(container, {
  data: [],
  rowHeaders: true,
  colHeaders: true,
  licenseKey: 'non-commercial-and-evaluation',
  outsideClickDeselects: false,
  /** enable row/column resize */
  manualColumnResize: true,
  manualRowResize: true,
  /** disable auto expand row/col */
  minSpareCols: 0,
  minSpareRows: 0,
  /** enable rol/column insert/remove */
  contextMenu: [
    'row_above',
    'row_below',
    'col_left',
    'col_right',
    '---------',
    'remove_row',
    'remove_col',
  ],
});

function bindSheet() {
  let binding = new SheetBinding(doc, hot);
  binding.setup();
}
