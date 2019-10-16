// tslint:disable:no-console

import { OT_SERVER_PORT } from "./const/config";
import Connection from "./connection";
import Doc from "./doc";
import StringBinding from "./string-binding";
import IO from "./io";

const socket = new WebSocket(`ws://localhost:${OT_SERVER_PORT}`);
socket.binaryType = 'arraybuffer';

const connection = new Connection(socket);
const doc = new Doc(connection);

let promise;
let url = new URL(document.URL);
if (url.searchParams.has('docId')) {
  promise = IO.getInstance().fetch(url.searchParams.get('docId') || '');
} else {
  promise = IO.getInstance().create().then(snapshot => {
    url.searchParams.set('docId', snapshot.getDocid());
    window.history.replaceState(null, 'doc', url.toString());
    return snapshot;
  });
}

promise.then(snapshot => {
  console.log('received snapshot: %s', JSON.stringify(snapshot.toObject()));
  doc.init(snapshot);

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
