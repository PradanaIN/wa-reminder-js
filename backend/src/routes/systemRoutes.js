const express = require('express');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const { getLogs, addLog } = require('../controllers/logController');
const { getQR, isBotActive } = require('../controllers/botController');
const { parseLogFilePerDay } = require('../utils/statParser');
const { TIMEZONE } = require('../utils/calendar');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    botActive: isBotActive(),
    timezone: TIMEZONE,
    timestamp: moment().tz(TIMEZONE).toISOString(),
  });
});

router.get('/logs', (req, res) => {
  const limit = Number.parseInt(req.query.limit, 10) || 100;
  res.json({ logs: getLogs(limit) });
});

router.get('/bot/status', (req, res) => {
  res.json({ active: isBotActive() });
});

router.get('/qr', (req, res) => {
  const qr = getQR();
  res.json({ qr });
});

router.get('/keepalive', (req, res) => {
  const now = moment().toISOString();
  addLog(`[KeepAlive] Ping diterima pada ${now}`);
  res.json({ status: 'alive', timestamp: now });
});

router.get('/stats', async (req, res, next) => {
  const logsDir = path.join(__dirname, '..', '..', 'logs');
  try {
    await fs.promises.mkdir(logsDir, { recursive: true });
    const combined = {
      messagesPerDay: {},
      errorsPerDay: {},
      uptimePerDay: {},
    };

    const files = (await fs.promises.readdir(logsDir)).filter((f) => f.endsWith('.log'));
    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(logsDir, file);
        const stats = await parseLogFilePerDay(filePath);

        Object.entries(stats.messagesPerDay).forEach(([date, count]) => {
          combined.messagesPerDay[date] = (combined.messagesPerDay[date] || 0) + count;
        });
        Object.entries(stats.errorsPerDay).forEach(([date, count]) => {
          combined.errorsPerDay[date] = (combined.errorsPerDay[date] || 0) + count;
        });
        Object.entries(stats.uptimePerDay).forEach(([date, hours]) => {
          combined.uptimePerDay[date] = (combined.uptimePerDay[date] || 0) + hours;
        });
      })
    );

    res.json(combined);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
