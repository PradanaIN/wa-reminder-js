const express = require("express");
const {
  startBot,
  stopBot,
  getQR,
  isBotActive,
} = require("../controllers/botController");

const router = express.Router();

router.post("/start", async (req, res) => {
  await startBot();
  res.send({ success: true, message: "Bot diaktifkan." });
});

router.post("/stop", async (req, res) => {
  await stopBot();
  res.send({ success: true, message: "Bot dinonaktifkan." });
});

router.get("/status", (req, res) => {
  res.send({ active: isBotActive() });
});

router.get("/qr", (req, res) => {
  const qr = getQR();
  if (!qr) return res.status(404).send({ error: "QR code not available" });
  res.send({ qr });
});

module.exports = router;
