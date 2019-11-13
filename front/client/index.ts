// tslint:disable:no-console

import Connection from "./connection";
import Doc from "./doc";
import StringBinding from "./string-binding";
import { DocType } from "scalable-ot-proto/gen/base_pb";

const connection = new Connection();
let url = new URL(document.URL);
const doc = new Doc(connection,
  DocType.PLAIN_TEXT,
  url.searchParams.get('docId') || undefined,
  url.searchParams.get('version') || undefined);

doc.init().then(() => {
  url.searchParams.set('docId', doc.id as string);
  window.history.replaceState(null, 'doc', url.toString());
  bindDoc();
}).catch(e => {
  console.error(e);
});

/**
 * bind doc with textarea
 */
function bindDoc() {
  let element = document.querySelector('textarea');
  let binding = new StringBinding(element as Element, doc);
  binding.setup();
}
