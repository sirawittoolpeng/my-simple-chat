const handler = require("./handler");
const helpers = require("./helpers");
module.exports = {
  join: function (io, socket, data, store) {
    if (handler.cmdCheck(data) == "join") {
      // Join Room Check ก่อนว่า room นี้ถูกใช้ชื่ออยู่หรือไม่
      if (io.sockets.adapter.rooms.has(data.roomId)) {
        if (!io.sockets.adapter.rooms.get(data.roomId).has(socket.id)) {
          io.to(data.roomId).emit(
            "chat",
            handler.setJoinRoomAnnounce(data, socket)
          );
          socket.join(data.roomId);

          helpers.sendChatHistory(io, store, data, socket);
          io.to(socket.id).emit(
            "chat",
            handler.setJoinRoomMsg(io, data, socket)
          );
        }
      } else {
        // กรณีที่ชื่อห้องที่ใส่มาไม่ active อยู่
        socket.join(data.roomId);
        io.to(data.roomId).emit(
          "chat",
          handler.setCreateRoomAnnounce(io, data, socket)
        );
      }
    }
  },
  leave: function (io, socket, data) {
    io.to(socket.id).emit("chat", handler.setLeaveRoomMsg(data, socket));
    io.to(socket.id).emit("chat", handler.cmdClearWindow(socket));
    // let oldRoom = handler.leaveRoom(data);
    socket.leave(data.oldRoomId);
    io.to(data.oldRoomId).emit(
      "chat",
      handler.setLeaveRoomAnnounce(data, socket)
    );
  },
  test: function () {
    console.log("hi");
  },
  execute: function (io, socket, data, store) {
    if (handler.cmdCheck(data) == "join") {
      this.join(io, socket, data, store);
    } else if (handler.cmdCheck(data) == "leave") {
      this.leave(io, socket, data);
      this.join(io, socket, data, store);
    }
  },
};
