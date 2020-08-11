// board setup
function boardInit(color) {
  let square = $(".square").first();
  let square_width = Math.ceil(parseFloat(square.css("width")));
  let square_height = Math.ceil(parseFloat(square.css("height")));

  let offset_width = square_width / 10,
    offset_height = square_height / 10,
    counter = 0;

  console.log(square_width, square_height);
  for (let i = 0; i < 64; i++) {
    let row = Math.floor(i / 8),
      col = i % 8;

    if ((row + col) % 2) {
      counter++;
      if (i < 24) {
        let first_piece = $(`#red-${counter}`);
        first_piece.css({
          top: row * square_height + offset_height,
          left: col * square_width + offset_width,
        });
      } else if (i > 39) {
        let second_piece = $(`#green-${counter - 20}`);
        second_piece.css({
          top: row * square_height + offset_height,
          left: col * square_width + offset_width,
        });
      }
    }
  }

  $(`.${color.first}`).css({ border: "2px solid yellow" }); // indicate which user is which with a border
  $(".piece").show();
}

// move functionality
function makeMove(turn) {
  let square = $(".square").first();
  $("." + turn).draggable({
    containment: "#board",
    grid: [
      Math.ceil(parseFloat(square.css("width"))),
      Math.ceil(parseFloat(square.css("height"))),
    ],
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
$button.on("click touchstart", () => {
  $button.prop("value", "Searching...⏳");

  socket.emit("search", socket.id);
});

socket.on("found", (data) => {
  $button.hide();
  let color = { first: "red", second: "green" }; // default values

  if (data.message.includes("green")) {
    color.first = "green";
    color.second = "red";
  }

  boardInit(color);

  $(window).on("resize", () => {
    boardInit(color);
  });
  makeMove(color.first); // prevents other side from making a move

  socket.emit("join", data.game_num); // join a room

  // alert(data.message);
});

$(".piece").on("mouseup touchend", function () {
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
});
