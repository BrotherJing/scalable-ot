// tslint:disable:no-console

import { OT_SERVER_PORT } from "./const/config";
import Connection from "./connection";
import Doc from "./doc";
import StringBinding from "./string-binding";

const socket = new WebSocket(`ws://localhost:${OT_SERVER_PORT}`);
socket.binaryType = 'arraybuffer';

const connection = new Connection(socket);
let url = new URL(document.URL);
const doc = new Doc(connection, url.searchParams.get('docId') || undefined);

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
