# scalable-ot
A scalable concurrent collaboration framework based on Operational Transformation (OT).

Inspired by [sharedb](https://github.com/share/sharedb).

### Examples

Text editor

<img src="https://brotherjing-static.s3-ap-northeast-1.amazonaws.com/img/textarea.gif" alt="textarea" width="400"/>

Spreadsheet

<img src="https://brotherjing-static.s3-ap-northeast-1.amazonaws.com/img/sheet.gif" alt="sheet" width="600"/>

### Architecture

<img src="https://brotherjing-static.s3-ap-northeast-1.amazonaws.com/img/scalable-ot.png" alt="arch" width="400"/>

### Project Structures

```
scalable-ot
├── front       // Client side code, including examples(textarea, spreadsheet)
├── ot-server   // Server which consume client operations and produce conflict-free operations
└── proto       // Protobuf definitions
```

```
scalable-ot-java-backend
├── scalable-ot-api         // Front facing api
├── scalable-ot-broadcast   // Web socket server which connect to clients
├── scalable-ot-consumer    // Service which consume and apply conflict-free operations
├── scalable-ot-core        // DTO, DAO, etc.
└── scalable-ot-kafka       // Kafka related configurations
```

### Features

- **Horizontal Scalable** Some services are implemented as Kafka consumer and are scalable in nature. 
Some are backed by RPC framework like [Dubbo](https://dubbo.apache.org) and have been customized to be scalable and load balanced 
based on specific rules.
- **Extensible** Can be extended to support concurrent editing on other type of document by adding OT libraries.
