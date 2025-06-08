const { createLogger, format, transports } = require("winston");
const path = require("path");
const DailyRotateFile = require("winston-daily-rotate-file");

function setupLogger(name) {
  return createLogger({
    level: "info",
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.printf(
        ({ timestamp, level, message }) =>
          `${timestamp} - ${level.toUpperCase()} - ${message}`
      )
    ),
    transports: [
      new DailyRotateFile({
        filename: path.join(__dirname, `../logs/${name}-%DATE%.log`),
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "14d", // simpan log 14 hari terakhir
      }),
    ],
  });
}

module.exports = { setupLogger };
