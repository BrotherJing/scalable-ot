import Handsontable from "handsontable";
import 'handsontable/dist/handsontable.full.css';
import Connection from "../connection";
import Doc from "../doc";
import { DocType } from "scalable-ot-proto/gen/base_pb";

const connection = new Connection();
let url = new URL(document.URL);
const doc = new Doc(connection,
  DocType.JSON,
  url.searchParams.get('docId') || undefined,
  url.searchParams.get('version') || undefined);

doc.init().then(() => {
  url.searchParams.set('docId', doc.id as string);
  window.history.replaceState(null, 'doc', url.toString());
  hot.loadData(doc.data);
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
  /** auto expand row/col */
  minSpareCols: 1,
  minSpareRows: 1,
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

hot.addHook('afterChange', (changes, source) => {
  if (source !== 'edit') {
    return;
  }
  changes!.forEach(([row, prop, oldVal, newVal]) => {
    console.info(`row ${row} prop ${prop}: ${oldVal} -> ${newVal}`);
  });
});

// row/column operation
// hot.alter('insert_row', 1, 2);

var button = document.getElementById('setButton') as Element;
button.addEventListener('click', function(event: Event) {
  var selected = hot.getSelected() as Array<Array<number>>;
  var target = (event.target as Element).id;

  for (var index = 0; index < selected.length; index += 1) {
    var item = selected[index];
    var startRow = Math.min(item[0], item[2]);
    var endRow = Math.max(item[0], item[2]);
    var startCol = Math.min(item[1], item[3]);
    var endCol = Math.max(item[1], item[3]);

    for (var rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
      for (var columnIndex = startCol; columnIndex <= endCol; columnIndex += 1) {
        if (target === 'setButton') {
          hot.setDataAtCell(rowIndex, columnIndex, 'data changed');
        }

        if (target === 'addButton') {
          hot.setCellMeta(rowIndex, columnIndex, 'className', 'c-deeporange');
        }
      }
    }
  }

  hot.render();
});

let hooks = Handsontable.hooks.getRegistered();
