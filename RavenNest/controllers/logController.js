// controllers/logController.js
const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "commands.log");

if (!fs.existsSync(logFile)) {
  fs.writeFileSync(logFile, "", "utf8");
}

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

module.exports = { logCommand };
