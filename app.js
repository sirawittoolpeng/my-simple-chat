const handler = require("./helper/handler");
const cmd = require("./helper/cmd");
const message = require("./helper/message");
// const util = require('util');
const {promisifyAll} =require("bluebird")
let bodyParser = require("body-parser");
let multer = require("multer");
let forms = multer();
const express = require("express"),
path = require("path");
const redis = require("redis")
promisifyAll(redis.RedisClient.prototype);
promisifyAll(redis.Multi.prototype);
store = redis.createClient();
// promisifyAll(redis)
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "/static")));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(forms.array());

io.on("connection", (socket) => {
  console.log("socket " + socket.id + " has connected.");
  socket.on("chat", (data) => {
    if (handler.checkDataType(data) === "cmd") {
      // Check ว่าเป็น cmd หรือว่า message(websocket established)
      cmd.execute(io, socket, data, store);
    } else if (handler.checkDataType(data) == "message") {
      // ถ้าเป็น message เฉยๆ
      message.execute(io, socket, data, store);
    }
  });
});
app.post("/cmd", (req, res) => {
  let data = {
    type: "message",
    username: "from-server",
    message: req.body.mobile,
    roomId: req.body.roomId ? req.body.roomId : "",
    style: ["font-size:x-large;color:red;text-align:center"],
  };
  io.sockets.emit("chat", { data, id: "all" });
  res.sendStatus(200);
});
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("listening on: ", port);
});
