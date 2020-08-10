const express = require("express");
const socket = require("socket.io");
const path = require("path");
const mysql = require("mysql");

require("dotenv").config();

const app = express();

var port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`listening on port ${port}`));
const io = socket(server);

// database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("successfully connected mysql database");
  }
});

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public"))); // calls index.html which calls client.js at the end so io will be defined there

app.get("/", (req, res) => {
  res.render("game");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

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
  });

  socket.on("join", (room_num) => {
    socket.join("game" + room_num);
  });

  socket.on("move", (piece_coords) => {
    var room = Object.values(socket.rooms)[1];
    socket.broadcast.to(room).emit("position", piece_coords); // send a message to both clients in that room
  });

  socket.on("disconnect", function () {
    // remove the player id from the search list
    let index = player_id.indexOf(socket.id);
    player_id.splice(index, 1);
  });
});
