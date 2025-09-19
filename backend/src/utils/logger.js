const fs = require('fs');
const path = require('path');
const { createLogger, format } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

function setupLogger(name) {
  const logDir = path.join(__dirname, '..', '..', 'logs');
  fs.mkdirSync(logDir, { recursive: true });

  return createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.printf(
        ({ timestamp, level, message }) =>
          `${timestamp} - ${level.toUpperCase()} - ${message}`
      )
    ),
    transports: [
      new DailyRotateFile({
        filename: path.join(logDir, `${name}-%DATE%.log`),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
      }),
    ],
  });
}

module.exports = { setupLogger };
