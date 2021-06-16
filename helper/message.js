const handler = require("./handler");
const helpers = require("./helpers");
const redis = require("redis");
const util = require("util");
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);

client.lrange = util.promisify(client.lrange);

client.get = util.promisify(client.get);

module.exports = {
  broadCast: function (io, socket, data, store) {
    helpers.recordChat(store, data);
    handler.BroadcastMsg(io, data, socket);
  },
  like: function (io, socket, data, store) {
    
    this.getLikes(
      data,
      store,
      function (items,side){
        // console.log(items);
        test = items
        let res = {
          command: "setLikes",
          param: [side,items.length],
          type: "cmd",
          username: "server",
        };
        io.to(data.roomId).emit("chat", { data: res, id: "all" });
      },
      (e) => {
        console.log(e);
      }
    );
    
  },
  execute: function (io, socket, data, store) {
    if (data.message.match(/^:(left|right)(Like)$/)) {
      this.like(io, socket, data, store);
    } else {
      this.broadCast(io, socket, data, store);
    }
  },
  getLikes: function (data, store, success, error) {
    const match = data.message.match(/^:(left|right)(Like)$/);
    if (match[1] === "left") {
      store.lrange(data.roomId + "_left_likes", 0, -1, (err, items) => {
        if (!err) {
          side = "left";
          // if(!items.includes(data.username)){
            store.rpush(data.roomId + "_left_likes",data.username)
          // }
          items.push(data.username)
          success(items,side);
        } else {
          error(err);
        }
      });
    } else if(match[1] === "right"){
      store.lrange(data.roomId + "_right_likes", 0, -1, (err, items) => {
        if (!err) {
          side = "right";
          // if(!items.includes(data.username)){
            store.rpush(data.roomId + "_right_likes",data.username)
          // }
          items.push(data.username)
          success(items,side);
        } else {
          error(err);
        }
      });

    }
  },
};
