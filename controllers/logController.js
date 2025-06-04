const moment = require("moment-timezone");
const { setupLogger } = require("../utils/logger");

const logger = setupLogger("app");

const logs = [];

function addLog(text) {
  const time = moment().format("HH:mm:ss");
  const logEntry = `[${time}] ${text}`;
  logs.push(logEntry);
  console.log(logEntry);
  logger.info(text); // simpan ke file log via winston
}

function getLogs(limit = 100) {
  return logs.slice(-limit);
}

module.exports = { addLog, getLogs };
