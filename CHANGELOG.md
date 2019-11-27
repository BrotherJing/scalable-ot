# [1.1.0](https://github.com/BrotherJing/scalable-ot/compare/1.0.0...1.1.0) (2019-11-19)


### Bug Fixes

* **front:** set command type before submit ([7a473fd](https://github.com/BrotherJing/scalable-ot/commit/7a473fd))
* convert between json operation proto and plain object ([558b376](https://github.com/BrotherJing/scalable-ot/commit/558b376))
* **front:** update import path and generalize some interfaces ([fa4ae39](https://github.com/BrotherJing/scalable-ot/commit/fa4ae39))
* **ot:** update import path and generalize some interfaces ([a89320d](https://github.com/BrotherJing/scalable-ot/commit/a89320d))
* **ot:** use comsumer group to receive latest op ([b86ae01](https://github.com/BrotherJing/scalable-ot/commit/b86ae01))


### Features

* **front:** load real data from backend into spreadsheet, setup connection ([37906ac](https://github.com/BrotherJing/scalable-ot/commit/37906ac))
* **front:** preview history at specified version ([a10079b](https://github.com/BrotherJing/scalable-ot/commit/a10079b))
* **front:** support copy/cut/paste command ([eb35ee1](https://github.com/BrotherJing/scalable-ot/commit/eb35ee1))
* **front:** support insert/remove column/row command ([aa1bf27](https://github.com/BrotherJing/scalable-ot/commit/aa1bf27))
* **front:** support simple concurrent editing in spreadsheet ([43950af](https://github.com/BrotherJing/scalable-ot/commit/43950af))
* **ot:** call broadcast module through grpc ([1e1fecf](https://github.com/BrotherJing/scalable-ot/commit/1e1fecf))
* **proto:** add .d.ts for the proto module ([2c08ec8](https://github.com/BrotherJing/scalable-ot/commit/2c08ec8))
* **proto:** generalize Command, Snapshot, etc. Add json operation type ([262a6c8](https://github.com/BrotherJing/scalable-ot/commit/262a6c8))



# [1.0.0](https://github.com/BrotherJing/scalable-ot/compare/f02f2dc...1.0.0) (2019-10-24)


### Bug Fixes

* **proto:** include docId in Snapshot ([b41279b](https://github.com/BrotherJing/scalable-ot/commit/b41279b))
* client cannot apply some operations properly ([ee8b7ed](https://github.com/BrotherJing/scalable-ot/commit/ee8b7ed))
* null check and delete operation ([f02f2dc](https://github.com/BrotherJing/scalable-ot/commit/f02f2dc))


### Features

* **backend:** consume user operation from kafka ([0eff9a6](https://github.com/BrotherJing/scalable-ot/commit/0eff9a6))
* **backend:** group ops and clients by document id ([ccfde10](https://github.com/BrotherJing/scalable-ot/commit/ccfde10))
* **front:** send init message on connection open ([7bd3e2f](https://github.com/BrotherJing/scalable-ot/commit/7bd3e2f))
* **frontend:** call fetch and create api ([5570bce](https://github.com/BrotherJing/scalable-ot/commit/5570bce))
* **frontend:** connect to new websocket server ([27067b5](https://github.com/BrotherJing/scalable-ot/commit/27067b5))
* **frontend:** implement catchup and call get ops api ([a86a350](https://github.com/BrotherJing/scalable-ot/commit/a86a350))
* **frontend:** send op through ajax ([b86d8f0](https://github.com/BrotherJing/scalable-ot/commit/b86d8f0))
* **ot:** add db implementation backed by mongodb ([e27897f](https://github.com/BrotherJing/scalable-ot/commit/e27897f))
* **ot:** send conflict-free op through kafka ([ff97d7b](https://github.com/BrotherJing/scalable-ot/commit/ff97d7b))
* **proto:** add new message type which wrap a list of command ([8b1bbbf](https://github.com/BrotherJing/scalable-ot/commit/8b1bbbf))
* **proto:** generate grpc service stub and type definition ([93fedc7](https://github.com/BrotherJing/scalable-ot/commit/93fedc7))



