// board setup
var $board = $("#board");
var offset = 10,
  counter = 0;
for (let i = 0; i < 64; i++) {
  let row = Math.floor(i / 8),
    col = i % 8;

  if ((row + col) % 2) {
    counter++;
    if (i < 24) {
      let red_piece = $("#red-" + counter);
      red_piece.css({ top: row * 100 + offset, left: col * 100 + offset });
    } else if (i > 39) {
      let green_piece = $("#green-" + (counter - 20));
      green_piece.css({ top: row * 100 + offset, left: col * 100 + offset });
    }
  }
}

// move functionality
function makeMove(turn) {
  $(".piece").draggable({
    containment: "#board",
    grid: [100, 100],
  });

  // drop on light
  $(".light").droppable({
    drop: (event, ui) => {
      ui.draggable.draggable("option", "revert", false);
    },
  });

  // revert on black
  $(".dark").droppable({
    drop: (event, ui) => {
      ui.draggable.draggable("option", "revert", true);
    },
  });

  // return turn == "green" ? "red" : "green";
}

var turn = "green";
makeMove(turn);

// socket connection/communication
const socket = io();

socket.on("connection", console.log("connected new socket"));

socket.on("welcome", (id) => {
  console.log("Welcome:" + id);
});

var $button = $("#request-play");
$button.on("click", () => {
  $button.prop("value", "Searching...⏳");

  socket.emit("search", socket.id);
});

socket.on("found", (message) => console.log(message));
