const fs = require("fs")
const readline = require("readline");

function parseDateFromLogLine(line) {
  const timestamp = line.split(" - ")[0];
  return new Date(timestamp);
}

function getDateKey(date) {
  return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

async function parseLogFilePerDay(logFilePath) {
  const fileStream = fs.createReadStream(logFilePath);
  const rl = readline.createInterface({ input: fileStream });

  const messagesPerDay = {};
  const errorsPerDay = {};
  const uptimePerDay = {};

  let currentUptimeStart = null;

  for await (const line of rl) {
    const date = parseDateFromLogLine(line);
    const dayKey = getDateKey(date);

    if (line.includes("Pesan berhasil dikirim")) {
      messagesPerDay[dayKey] = (messagesPerDay[dayKey] || 0) + 1;
    }

    if (line.includes("[Error]") || line.includes("Unhandled Rejection")) {
      errorsPerDay[dayKey] = (errorsPerDay[dayKey] || 0) + 1;
    }

    if (line.includes("✅ Bot berhasil diaktifkan")) {
      currentUptimeStart = date;
    }

    if (line.includes("🛑 Bot dinonaktifkan") && currentUptimeStart) {
      const duration = (date - currentUptimeStart) / (1000 * 60 * 60); // jam
      const key = getDateKey(currentUptimeStart);
      uptimePerDay[key] = (uptimePerDay[key] || 0) + duration;
      currentUptimeStart = null;
    }
  }

  return { messagesPerDay, errorsPerDay, uptimePerDay };
}

module.exports = { parseLogFilePerDay };
