var express = require("express");
var socket = require("socket.io");
var app = express();

var port = process.env.PORT || 3000;
var server = app.listen(port, () => console.log(`listening on port ${port}`));
const io = socket(server);

app.use(express.static("public")); // calls index.html which calls client.js at the end so io will be defined there

var player_id = []; // increases when player presses 'play'
var num_players = 0;
io.on("connection", (socket) => {
  socket.emit("welcome", socket.id);

  socket.on("search", (id) => {
    if (!player_id.includes(id)) {
      player_id.push(id);
    }

    if (player_id.length % 2 == 0) {
      //   io.to(player_id[0]).to(player_id[1]).emit("found", "Player found!"); // send a message to both
      io.to(player_id[num_players]).emit(
        "found",
        "Player found! You are green."
      );
      io.to(player_id[num_players + 1]).emit(
        "found",
        "Player found! You are red."
      );

      num_players += 2;
    }

    console.log({ player_id });
  });

  socket.on("move", (piece_coords) => {
    let which_socket;
    if (piece_coords.socket == player_id[num_players - 2]) {
      which_socket = player_id[num_players - 1];
    } else {
      which_socket = player_id[num_players - 2];
    }
    io.to(which_socket).emit("position", piece_coords); // send a message to both
  });

  socket.on("disconnect", function () {
    // remove the player id from the search list
    let index = player_id.indexOf(socket.id);
    player_id.splice(index, 1);
  });
});
