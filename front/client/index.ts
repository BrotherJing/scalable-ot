// tslint:disable:no-console
import {Command, Snapshot} from "scalable-ot-proto/gen/text_pb";
import { OT_SERVER_PORT } from "./config";
import Connection from "./connection";
import Doc from "./doc";
import StringBinding from "./string-binding";

const socket = new WebSocket(`ws://localhost:${OT_SERVER_PORT}`);
socket.binaryType = 'arraybuffer';

const connection = new Connection(socket);
const doc = new Doc(connection, "wtf");

// TODO: fetch snapshot
const snapshot = new Snapshot();
snapshot.setVersion(0);
snapshot.setData("");
doc.init(snapshot);

// bind doc with textarea
let element = document.querySelector('textarea');
let binding = new StringBinding(element as Element, doc);
binding.setup();
