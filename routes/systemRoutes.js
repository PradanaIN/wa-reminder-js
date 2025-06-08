const express = require("express");
const moment = require("moment-timezone");
const { getLogs, addLog, getStats } = require("../controllers/logController");
const { getQR, isBotActive } = require("../controllers/botController");

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
router.get("/stats", (req, res) => {
  const stats = getStats();
  res.send(stats);
});

module.exports = router;
