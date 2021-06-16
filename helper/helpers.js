module.exports = {
  sendChatHistory: function (io, store, data, socket) {
    let chatName = "chat_history_" + data.roomId;
    store.lrange(chatName, 0, -1, (err, items) => {
      if (err) return;
      let oldChat = "";
      items.forEach((item) => {
        oldChat = JSON.parse(item);
        oldChat.message = oldChat.username + ' : "' + oldChat.message + '"';
        io.to(socket.id).emit("chat", {
          data: oldChat,
          id: socket.id,
        });
      });
    });
  },
  recordChat: function (store, data) {
    const jsonStr = JSON.stringify(data);
    let chatName = "chat_history_" + data.roomId;
    try {
      store.rpush(chatName, jsonStr);
    } catch (err) {
      console.log(err);
    }
  },
  isSocketInRoom: function (io, store, data, socket) {
    let isSocketInRoom = io.sockets.adapter.rooms
      .get(data.roomId)
      .has(socket.id);

    return isSocketInRoom;
  },
  isRoomHasChat: function (io, store, data, socket) {
    let isRoomActive = io.sockets.adapter.rooms.has(data.roomId);
    console.log(isRoomActive);
    return isRoomActive;
  },
  isChatHistoryExisted: function (io, store, data, socket) {
    let chatName = "chat_history_" + data.roomId;
    let isChatHistoryExisted = store.lrange(chatName, 0, 99, (err, items) => {
      if (err) return;
      return items.length <= 0 ? false : true;
    });
    console.log(isChatHistoryExisted);
    return isChatHistoryExisted;
  },
};
