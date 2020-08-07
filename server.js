var express = require("express");
var app = express();

var port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}`));
app.use(express.static("public"));
