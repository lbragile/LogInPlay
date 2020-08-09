var express = require("express");
var socket = require("socket.io");
var app = express();

var port = process.env.PORT || 3000;
var server = app.listen(port, () => console.log(`listening on port ${port}`));
const io = socket(server);

app.use(express.static("public")); // calls index.html which calls client.js at the end so io will be defined there

var player_id = []; // increases when player presses 'play'
var num_players = 0,
  game_num = 0;
io.on("connection", (socket) => {
  socket.emit("welcome", socket.id);

  socket.on("search", (id) => {
    if (!player_id.includes(id)) {
      player_id.push(id);
    }

    if (player_id.length % 2 == 0) {
      //   io.to(player_id[0]).to(player_id[1]).emit("found", "Player found!"); // send a message to both
      game_num++;

      io.to(player_id[num_players]).emit("found", {
        message: "Player found! You are green.",
        game_num: game_num,
      });
      io.to(player_id[num_players + 1]).emit("found", {
        message: "Player found! You are red.",
        game_num: game_num,
      });

      num_players += 2;
    }

    // console.log(io.sockets.adapter.rooms);
  });

  socket.on("join", (room_num) => {
    socket.join("game" + room_num);
  });

  socket.on("move", (piece_coords) => {
    var room = Object.values(socket.rooms)[1];
    console.log(room);
    socket.broadcast.to(room).emit("position", piece_coords); // send a message to both
  });

  socket.on("disconnect", function () {
    // remove the player id from the search list
    let index = player_id.indexOf(socket.id);
    player_id.splice(index, 1);
  });
});
