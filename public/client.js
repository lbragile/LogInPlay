// socket connection/communication
const socket = io();

socket.on("connection", console.log("connected new socket"));

socket.on("welcome", (id) => {
  console.log("Welcome:" + id);
});

var $button = $("#request-play");
$button.on("mousedown touchstart", () => {
  $button.html("Searching...⏳");
  socket.emit("search", socket.id);
});

socket.on("found", (data) => {
  $button.hide();
  socket.player = data.player;
  socket.emit("join", data.game_num); // join a room

  alert(data.message);
});

$("td").on("click touchstart", function () {
  if ($("#turn").html().split(" ")[1] == socket.player) {
    setTimeout(() => {
      let piece_coords = [];
      $.each($("td"), (index, value) => {
        let data = {
          id: value.id,
          content: value.textContent,
          turn: $("#turn").html(),
          socket: socket.id,
        };
        piece_coords.push(data);
      });

      socket.emit("move", { piece_coords, cell_id: this.id });
    }, 100);
  }
});

socket.on("position", (data) => {
  data.piece_coords.forEach((element) => {
    let cell_of_interest = document.getElementById(element.id);
    cell_of_interest.textContent = element.content;
  });

  $("#turn").html(data.piece_coords[0].turn);
  set(document.getElementById(data.cell_id));
});

// new game for both clients in the room
$("#new-game").on("click touchstart", function () {
  socket.emit("new_game");
});

socket.on("restart", function () {
  startNewGame();
  $("#turn").html("Turn: X"); // reset to X going first
});
