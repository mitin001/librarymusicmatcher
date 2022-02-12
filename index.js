const express = require("express");
const server = express();
const PORT = process.env.PORT || 80;

const parser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");

server.use(parser.urlencoded({extended: true}));
server.use(parser.json({limit: "8mb"}));
server.use(cors());
// server.use(csp({directives: {defaultSrc: ["'none'"], connectSrc: ["'none'"]}}));
server.use(express.static("public"));
server.use(fileUpload({
  limits: {fileSize: 500 * 1024 * 1024},
  useTempFiles: true,
}));

server.use("/upload", require("./upload").router);
server.use("/matches", require("./matches").router);

server.listen(PORT, () => console.log(`Server started. PORT ${PORT}`));
