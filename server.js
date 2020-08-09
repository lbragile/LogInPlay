var express = require("express");
var socket = require("socket.io");
var app = express();

var port = process.env.PORT || 3000;
var server = app.listen(port, () => console.log(`listening on port ${port}`));
const io = socket(server);

app.use(express.static("public")); // calls index.html which calls client.js at the end so io will be defined there

var player_id = []; // increases when player presses 'play'

io.on("connection", (socket) => {
  socket.emit("welcome", socket.id);

  socket.on("search", (id) => {
    if (!player_id.includes(id)) {
      player_id.push(id);
    }

    if (player_id.length % 2 == 0) {
      io.to(player_id[0]).to(player_id[1]).emit("found", "Player found!");
      io.to(player_id[0]).emit("found", "You are green");
      io.to(player_id[1]).emit("found", "You are red");
    }

    // console.log({ player_id });
  });
});
