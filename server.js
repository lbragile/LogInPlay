const express = require("express");
const socket = require("socket.io");
const path = require("path");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());

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
    console.log("Successfully connected mysql database");
  }
});

var pwd_public = path.join(__dirname, "public");
app.set("views", pwd_public); // change the views folder
app.set("view engine", "ejs"); // set the engine
app.use(express.static(pwd_public)); // use all files defined in public folder

app.get("/", (req, res) => {
  jwt.verify(
    req.cookies[process.env.SECRET_TOKEN_NAME],
    process.env.SECRET_TOKEN,
    (error, data) => {
      if (error) {
        res.render("login", { message: "" });
      } else {
        res.render("game");
      }
    }
  );
});

app.get("/login", (req, res) => {
  jwt.verify(
    req.cookies[process.env.SECRET_TOKEN_NAME],
    process.env.SECRET_TOKEN,
    (error, data) => {
      if (error) {
        res.render("login", { message: "" });
      } else {
        res.render("game");
      }
    }
  );
});

app.get("/register", (req, res) => {
  jwt.verify(
    req.cookies[process.env.SECRET_TOKEN_NAME],
    process.env.SECRET_TOKEN,
    (error, data) => {
      if (error) {
        res.render("register", { message: "" });
      } else {
        res.render("game");
      }
    }
  );
});

app.get("/logout", (req, res) => {
  res.cookie("access_token", "", { maxAge: -1 });
  res.status(302).redirect("/login");
});

app.post("/register", (req, res) => {
  const { username, email, password, confirm_password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ? OR email = ?",
    [username, email],
    async (error, result) => {
      if (error) {
        console.log(error);
      } else if (result.length > 0) {
        let resp_message =
          result[0].email == email ? "Email already exists" : "Username taken";
        return res.render("register", {
          message: resp_message,
        });
      } else if (password != confirm_password) {
        return res.render("register", {
          message: "Passwords do not match",
        });
      }

      let hash_password = await bcrypt.hash(password, 10);
      let details = {
        username,
        email,
        password: hash_password,
      };
      db.query("INSERT INTO users SET ?", details, (error, result) => {
        if (error) {
          console.log(error);
        } else {
          return res.render("register", {
            message: "User successfully registered",
          });
        }
      });
    }
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ? OR email = ?",
    [username, username],
    async (error, result) => {
      if (error) {
        console.log(error);
      } else if (result.length == 0) {
        return res
          .status(400)
          .render("login", { message: "Incorrect Username/Email" });
      } else if (!(await bcrypt.compare(password, result[0].password))) {
        return res
          .status(401)
          .render("login", { message: "Incorrect Password" });
      } else {
        var token = jwt.sign({ username }, process.env.SECRET_TOKEN);
        res.cookie("access_token", token, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24, // 1 day
          signed: false,
        });
        res.status(302).redirect("/");
      }
    }
  );
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
        message: "Player found, you are X.\nYou go first!",
        game_num,
        player: "X",
      });
      io.to(player_id[num_players + 1]).emit("found", {
        message: "Player found, you are O.",
        game_num,
        player: "O",
      });

      num_players += 2;
    }
  });

  socket.on("join", (room_num) => {
    socket.join("game" + room_num);
  });

  socket.on("move", (data) => {
    var room = Object.values(socket.rooms)[1];
    io.in(room).emit("position", data); // send a message to both clients in that room
  });

  socket.on("new_game", () => {
    var room = Object.values(socket.rooms)[1];
    io.in(room).emit("restart"); // send a message to both clients in that room
  });

  socket.on("disconnect", function () {
    // remove the player id from the search list
    let index = player_id.indexOf(socket.id);
    player_id.splice(index, 1);
  });
});
