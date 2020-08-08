var express = require("express");
var socket = require("socket.io");
var app = express();

var port = process.env.PORT || 3000;
var server = app.listen(port, () => console.log(`listening on port ${port}`));
const io = socket(server);

app.use(express.static("public")); // calls index.html which calls client.js at the end so io will be defined there

io.on("connection", (socket) => {
  socket.emit("welcome", socket.id);
});
