module.exports = {
  checkDataType: function (data) {
    return data.type;
  },
  cmdCheck: function (data) {
    return data.message;
  },
  sendRoomInfo: function (data, msgType) {
    if (msgType === "join") {
    } else if (msgType === "create") {
    }
  },
  leaveRoom: function (data) {
    return data.oldRoomId;
  },
  setJoinRoomAnnounce: function (data, socket) {
    const announce = {
      type: "message",
      username: "from-server",
      message:
        data.username == ""
          ? socket.id
          : data.username + " has joined room : " + data.roomId,
      roomId: data.roomId,
      style: ["text-align:center;"],
    };
    return { data: announce, id: socket.id };
  },
  setJoinRoomMsg: function (io, data, socket) {
    const announce = {
      type: "message",
      username: "from-server",
      message:
        data.username == ""
          ? socket.id
          : "You have joined room : " + data.roomId,
      roomId: data.roomId,
      style: ["text-align:center;"],
    };
    io.to(socket.id).emit("chat", this.cmdSetWindow(data, socket));
    return { data: announce, id: socket.id };
  },
  setCreateRoomAnnounce: function (io, data, socket) {
    const announce = {
      type: "message",
      username: "from-server",
      message:
        data.username == ""
          ? socket.id
          : "You have created room : " + data.roomId + ".",
      roomId: data.roomId,
      style: ["text-align:center;"],
    };
    // console.log("hihi");

    io.to(socket.id).emit("chat", this.cmdSetWindow(data, socket));
    return { data: announce, id: socket.id };
  },
  setLeaveRoomMsg: function (data, socket) {
    let oldRoom = this.leaveRoom(data);
    const announce = {
      type: "message",
      username: "server",
      message:
        data.username == ""
          ? socket.id
          : "You have left room : " + oldRoom + ".",
      roomId: data.roomId,
      style: ["text-align:center;"],
    };
    return { data: announce, id: socket.id };
  },
  setLeaveRoomAnnounce: function (data, socket) {
    let oldRoom = this.leaveRoom(data);
    const announce = {
      type: "message",
      username: "server",
      message:
        data.username == "" ? socket.id : data.username + " has left the room.",
      roomId: data.roomId,
      style: ["text-align:center;"],
    };
    return { data: announce, id: socket.id };
  },
  BroadcastMsg: function (io, data, socket) {
    const msg = data;
    msg.message = '"' + data.message + '"';
    io.to(socket.id).emit("chat", { data: msg, id: socket.id });
    msg.message = data.username + " : " + data.message;
    // console.log(data);
    socket.broadcast.to(data.roomId).emit("chat", { data: msg, id: socket.id });
  },
  cmdClearWindow: function (socket) {
    const announce = {
      type: "cmd",
      username: "server",
      command: "clearChat",
    };
    return { data: announce, id: socket.id };
  },
  cmdSetWindow: function (data, socket) {
    const announce = {
      type: "cmd",
      username: "server",
      command: "setWindowTitle",
      param: "Chatroom : " + data.roomId,
    };
    return { data: announce, id: socket.id };
  },
};
