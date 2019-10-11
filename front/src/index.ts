import express from "express";
import path from "path";
const app = express();
const port = 8081;

app.use(express.static("static"));

// Static files configuration
app.use("/assets", express.static(path.join(__dirname, "client")));

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
