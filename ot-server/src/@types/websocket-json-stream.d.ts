///<reference types="node" />
///<reference types="ws" />

declare module '@teamwork/websocket-json-stream' {
  import * as stream from 'stream';
  import WebSocket from 'ws';

  class WebSocketJSONStream extends stream.Duplex {
      constructor(ws: WebSocket);
  
      ws: WebSocket;
  }
  
  export = WebSocketJSONStream;
}
