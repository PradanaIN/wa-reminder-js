const { createLogger, format, transports } = require("winston");
const path = require("path");

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
      new transports.File({
        filename: path.join(__dirname, `../logs/${name}.log`),
      }),
    ],
  });
}

module.exports = { setupLogger };
