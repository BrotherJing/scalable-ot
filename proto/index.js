let protos = [
  require('./gen/base_pb'),
  require('./gen/text_pb'),
  require('./gen/base_grpc_pb'),
]

for (let p of protos) {
  for (let m in p) {
    exports[m] = exports[m] || p[m];
  }
}

exports.grpc = require('grpc');
