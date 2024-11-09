// app.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const corsOptions = require("./config/corsOptions");
const { upload, uploadFile } = require("./controllers/fileController");
const { handleBotConnection } = require("./controllers/botController");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: corsOptions });

const uploadDir = path.join(__dirname, "uploads");
const downloadDir = path.join(__dirname, "downloads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

app.use(cors(corsOptions));
app.use("/downloads", express.static(downloadDir));
app.use(express.static("public"));

app.post("/upload", upload.single("file"), uploadFile);

io.on("connection", (socket) => handleBotConnection(socket, io));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
