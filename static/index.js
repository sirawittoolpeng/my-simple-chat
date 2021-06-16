const socket = io();
const chat = document.querySelector("#chat-submit");
const chatInput = document.querySelector("#chat-input");
const nameInput = document.querySelector("#name");
const join = document.querySelector("#join-submit");
const chatRoom = document.querySelector("#room");
const chatDump = document.querySelector("#chat-dump");
const leftLikeBtn = document.querySelector("#L-like");
const rightLikeBtn = document.querySelector("#R-like");
const payload = {
  type: "message",
  username: "",
  message: "",
  roomId: "",
  oldRoomId: null,
};
const state = {
  isInRoom: false,
  room: "",
  name: "",
};
leftLikeBtn.addEventListener("click", (e) => {
  handleLeftLikeBtn();
});
rightLikeBtn.addEventListener("click", (e) => {
  handleRightLikeBtn();
});

join.addEventListener("click", (e) => {
  // กรณีที่ยังไม่ได้อยู่ในห้องไหนมาก่อน
  if (state.isInRoom === false) {
    handleJoinRoom();
    state.isInRoom = true;
    state.room = chatRoom.value;
    state.name = nameInput.value;
  } else if (state.isInRoom && state.room !== chatRoom.value) {
    // ถ้าเปลี่ยนห้อง ให้ออกจากห้องที่เคยอยู่ก่อน
    handleLeaveRoom();
    state.room = chatRoom.value;
    state.name = nameInput.value;
  }
});
chat.addEventListener("click", (e) => {
  console.log("is in room = " + state.isInRoom);
  if (state.isInRoom) handleInputMsg();
});
chatInput.addEventListener("keyup", (e) => {
  if (e.keyCode === 13 && state.isInRoom) handleInputMsg();
});

const handleInputMsg = () => {
  if (chatRoom.value === "") {
    alert("Please specify room no.");
  }
  if (chatInput.value.match(/^#!\/CLEAR$/)) {
    chatCmd.clear();
  } else if (chatInput.value.match(/(^#!\/WINDOW)(:)([0-9A-Za-z-_]{1,20})/)) {
    let match = chatInput.value.match(/(^#!\/WINDOW)(:)([0-9A-Za-z-_]{1,20})/);
    chatCmd.setWindowTitle(match[3]);
    // console.log(match);
  } else {
    if (chatInput.value !== "") {
      payload.type = "message";
      payload.roomId = chatRoom.value;
      payload.message = chatInput.value;
      socket.emit("chat", payload);
    }
  }
  chatInput.value = "";
};

const handleJoinRoom = () => {
  if (chatRoom.value === "") {
    alert("Please specify room no.");
  }
  if (nameInput.value === "") {
    alert("Please specify your name for chat.");
  }
  payload.type = "cmd";
  payload.roomId = chatRoom.value;
  payload.username = nameInput.value;
  payload.message = "join";
  socket.emit("chat", payload);
};
const handleLeaveRoom = () => {
  if (chatRoom.value === "") {
    alert("Please specify room no.");
  }
  if (nameInput.value === "") {
    alert("Please specify your name for chat.");
  }
  payload.type = "cmd";
  payload.roomId = chatRoom.value;
  payload.oldRoomId = state.room;
  payload.username = state.name;
  payload.message = "leave";
  socket.emit("chat", payload);
};

const handleLeftLikeBtn = () => {
  if (chatRoom.value === "") {
    alert("Please specify room no.");
  }
  if (nameInput.value === "") {
    alert("Please specify your name for chat.");
  }
  payload.type = "message";
  payload.roomId = chatRoom.value;
  payload.oldRoomId = state.room;
  payload.username = state.name;
  payload.message = ":leftLike";
  socket.emit("chat", payload);
};
const handleRightLikeBtn = () => {
  if (chatRoom.value === "") {
    alert("Please specify room no.");
  }
  if (nameInput.value === "") {
    alert("Please specify your name for chat.");
  }
  payload.type = "message";
  payload.roomId = chatRoom.value;
  payload.oldRoomId = state.room;
  payload.username = state.name;
  payload.message = ":rightLike";
  socket.emit("chat", payload);
};

socket.on("chat", (message) => {
  // console.log("broadcast from server: ", message);
});

const render = ({ data, id }) => {
  const div = document.createElement("div");
  div.classList.add("chat-message");
  if (id === socket.id) {
    // broadcasted chat is from this client
    div.classList.add("chat-message--user");
  }
  if (data.username !== state.name) {
    div.classList.remove("chat-message--user");
  }
  if (typeof data.style !== "undefined" && data.style !== []) {
    data.style.forEach((element) => {
      div.style.cssText += element;
    });
  }
  console.log(data);
  div.innerText = data.message; // insert content of message into div
  chatDump.appendChild(div);
};
const execute = ({ data, id }) => {
  if (data.command === "clearChat") {
    chatCmd.clear();
  } else if (data.command === "setWindowTitle") {
    chatCmd.setWindowTitle(data.param);
  } else if (data.command === "setLikes") {
    // leftLikeBtn.value = "Red Corner" + data.param
    if (data.param[0] === "left") {
      leftLikeBtn.value = "Red Corner : " + data.param[1];
    } else if (data.param[0] === "right") {
      rightLikeBtn.value = "Blue Corner : " + data.param[1];
    }
  }
};
const chatCmd = {
  clear: function () {
    while (chatDump.firstChild) {
      chatDump.removeChild(chatDump.lastChild);
    }
  },
  setWindowTitle: function (data) {
    document.title = data;
  },
};
socket.on("chat", (data) => {
  if (data.data.type === "message") render(data);
  if (data.data.type === "cmd") execute(data);
});
