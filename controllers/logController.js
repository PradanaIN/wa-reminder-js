const moment = require("moment-timezone");
const { setupLogger } = require("../utils/logger");
const { emitLogUpdate } = require("../utils/socketHandler");

const logger = setupLogger("app");

const MAX_LOG_ENTRIES = 100; // batasi jumlah log di memori
const logs = [];

function addLog(text) {
  const time = moment().format("HH:mm:ss");
  const logEntry = `[${time}] ${text}`;

  // Jika sudah mencapai limit, hapus log terlama
  if (logs.length >= MAX_LOG_ENTRIES) {
    logs.shift();
  }

  logs.push(logEntry);
  console.log(logEntry);
  logger.info(text); // simpan ke file log via winston

  // Kirim update log via WebSocket
  emitLogUpdate(logEntry);
}

function getLogs(limit = 100) {
  return logs.slice(-limit);
}

// getStats untuk mendapatkan statistik log
function getStats() {
  const stats = {
    messagesPerDay: {},
    errorsPerDay: {},
    uptimePerDay: {},
  };

  for (const log of logs) {
    const matchDate = log.match(/\[(\d{4}-\d{2}-\d{2})/);
    const date = matchDate ? matchDate[1] : "Unknown";

    if (
      log.includes("[Bot] Pesan terkirim") ||
      log.includes("[Bot] 🚀 Mengirim pesan")
    ) {
      stats.messagesPerDay[date] = (stats.messagesPerDay[date] || 0) + 1;
    }

    if (log.includes("❌")) {
      stats.errorsPerDay[date] = (stats.errorsPerDay[date] || 0) + 1;
    }

    if (log.includes("💓")) {
      stats.uptimePerDay[date] = (stats.uptimePerDay[date] || 0) + 1;
    }
  }

  return stats;
}

module.exports = { addLog, getLogs, getStats };
