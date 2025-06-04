const express = require("express");
const moment = require("moment-timezone");
const { getLogs, addLog } = require("../controllers/logController");

const router = express.Router();

router.get("/logs", (req, res) => {
  res.send({ logs: getLogs(100) });
});

router.get("/status", (req, res) => {
  res.send({ status: "API Running" });
});

router.get("/keepalive", (req, res) => {
  const now = moment().toISOString();
  addLog(`[KeepAlive] Ping diterima pada ${now}`);
  res.send({ status: "alive" });
});

module.exports = router;
