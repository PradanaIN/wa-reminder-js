const moment = require("moment-timezone");
const { setupLogger } = require("../utils/logger");
const { emitLogUpdate } = require("../utils/socketHandler");

const logger = setupLogger("app");

const MAX_LOG_ENTRIES = 100;
const logs = [];

function addLog(text, level = "info") {
  const time = moment().format("HH:mm:ss");
  const logEntry = `[${time}] ${text}`;

  if (logs.length >= MAX_LOG_ENTRIES) {
    logs.shift();
  }

  logs.push(logEntry);
  console.log(logEntry);

  // Log ke file berdasarkan level
  switch (level) {
    case "error":
      logger.error(text);
      break;
    case "warn":
      logger.warn(text);
      break;
    default:
      logger.info(text);
  }

  emitLogUpdate(logEntry);
}

function getLogs(limit = 100) {
  return logs.slice(-limit);
}

function getStats() {
  const stats = {
    messagesPerDay: {},
    errorsPerDay: {},
    uptimePerDay: {},
  };

  for (const log of logs) {
    const todayStr = moment().format("YYYY-MM-DD");

    if (log.includes("Pesan") || log.includes("Mengirim ke")) {
      stats.messagesPerDay[todayStr] =
        (stats.messagesPerDay[todayStr] || 0) + 1;
    }
    if (log.includes("❌") || log.includes("ERROR")) {
      stats.errorsPerDay[todayStr] = (stats.errorsPerDay[todayStr] || 0) + 1;
    }
    if (log.includes("💓")) {
      stats.uptimePerDay[todayStr] = (stats.uptimePerDay[todayStr] || 0) + 1;
    }
  }

  return stats;
}

module.exports = { addLog, getLogs, getStats };
