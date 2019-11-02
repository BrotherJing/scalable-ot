import Handsontable from "handsontable";
import 'handsontable/dist/handsontable.full.css';

const data = [
  ['', 'Tesla', 'Volvo', 'Toyota', 'Ford'],
  ['2019', 10, 11, 12, 13],
  ['2020', 20, 11, 14, 13],
  ['2021', 30, 15, 12, 13]
];

const container = document.getElementById('sheet') as Element;
const hot = new Handsontable(container, {
  data: data,
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
