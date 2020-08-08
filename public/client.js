const socket = io();

socket.on("connection", console.log("connected new socket"));

socket.on("welcome", (id) => {
  console.log("Welcome:" + id);
});

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
