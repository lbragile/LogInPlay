// board setup
function boardInit(color) {
  var offset = 10,
    counter = 0;
  for (let i = 0; i < 64; i++) {
    let row = Math.floor(i / 8),
      col = i % 8;

    if ((row + col) % 2) {
      counter++;
      if (i < 24) {
        let first_piece = $(`#${color.first}-${counter}`);
        first_piece.css({ top: row * 100 + offset, left: col * 100 + offset });
      } else if (i > 39) {
        let second_piece = $(`#${color.second}-${counter - 20}`);
        second_piece.css({ top: row * 100 + offset, left: col * 100 + offset });
      }
    }
  }
}

// move functionality
function makeMove(turn) {
  $("." + turn).draggable({
    containment: "#board",
    grid: [100, 100],
  });

  // drop on dark
  $(".dark").droppable({
    drop: (event, ui) => {
      ui.draggable.draggable("option", "revert", false);
    },
  });

  // revert on light
  $(".light").droppable({
    drop: (event, ui) => {
      ui.draggable.draggable("option", "revert", true);
    },
  });
}

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

boardInit({ first: "red", second: "green" }); // display something before an event happens

socket.on("found", (message) => {
  $button.hide();
  let color = { first: "red", second: "green" }; // default values

  if (message.includes("green")) {
    color.first = "green";
    color.second = "red";
  }

  boardInit(color);
  makeMove("green");
  // alert(message);
});

// var green_move = true,
//   red_move = false;

$(".piece").on("mouseup", function () {
  let piece_coords = [];
  $.each($(".piece"), (index, value) => {
    let data = {
      id: value.id,
      top: $(value).css("top"),
      left: $(value).css("left"),
      socket: socket.id,
    };
    piece_coords.push(data);
  });

  socket.emit("move", piece_coords);
});

socket.on("position", (data) => {
  data.forEach((element) => {
    $("#" + element.id).css({
      top: element.top,
      left: element.left,
    });
  });

  let degrees = 180;
  $("#board").css({
    "-webkit-transform": "rotate(" + degrees + "deg)",
    "-moz-transform": "rotate(" + degrees + "deg)",
    "-ms-transform": "rotate(" + degrees + "deg)",
    transform: "rotate(" + degrees + "deg)",
  });
});
