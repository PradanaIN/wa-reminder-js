const express = require("express");
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");
const { getLogs, addLog } = require("../controllers/logController");
const { getQR, isBotActive } = require("../controllers/botController");
const { parseLogFilePerDay } = require("../utils/statParser");

const router = express.Router();

// Halaman dashboard utama
router.get("/", (req, res) => {
  res.redirect("/dashboard");
});

router.get("/dashboard", (req, res) => {
  const qr = getQR();
  const logs = getLogs(100);
  const isActive = isBotActive();
  res.render("dashboard", {
    logs,
    botStatus: isActive ? "🟢 AKTIF" : "🔴 NONAKTIF",
    isActive,
    qr,
  });
});

// API Log
router.get("/logs", (req, res) => {
  res.send({ logs: getLogs(100) });
});

// API Status Bot
router.get("/bot/status", (req, res) => {
  res.send({ active: isBotActive() });
});

// API QR Code
router.get("/qr", (req, res) => {
  const qr = getQR();
  res.send({ qr });
});

// API Keepalive
router.get("/keepalive", (req, res) => {
  const now = moment().toISOString();
  addLog(`[KeepAlive] Ping diterima pada ${now}`);
  res.send({ status: "alive" });
});

// API Statistik
router.get("/stats", async (req, res) => {
  const logsDir = path.join(__dirname, "../logs");
  const files = fs.readdirSync(logsDir).filter((f) => f.endsWith(".log"));

  const combined = {
    messagesPerDay: {},
    errorsPerDay: {},
    uptimePerDay: {},
  };

  for (const file of files) {
    const filePath = path.join(logsDir, file);
    const stats = await parseLogFilePerDay(filePath);

    for (const [date, count] of Object.entries(stats.messagesPerDay)) {
      combined.messagesPerDay[date] =
        (combined.messagesPerDay[date] || 0) + count;
    }
    for (const [date, count] of Object.entries(stats.errorsPerDay)) {
      combined.errorsPerDay[date] = (combined.errorsPerDay[date] || 0) + count;
    }
    for (const [date, hours] of Object.entries(stats.uptimePerDay)) {
      combined.uptimePerDay[date] = (combined.uptimePerDay[date] || 0) + hours;
    }
  }

  res.json(combined);
});

module.exports = router;
