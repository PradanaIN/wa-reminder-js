const express = require("express");
const {
  startBot,
  stopBot,
  getQR,
  isBotActive,
} = require("../controllers/botController");

const router = express.Router();

router.post("/start", async (req, res) => {
  try {
    await startBot();
    res.json({ message: "Bot berhasil diaktifkan." });
  } catch (e) {
    console.error("[Bot Start Error]", e);
    res.status(500).json({ message: "Gagal mengaktifkan bot." });
  }
});

router.post("/stop", async (req, res) => {
  try {
    await stopBot();
    res.json({ message: "Bot berhasil dihentikan." });
  } catch (e) {
    console.error("[Bot Stop Error]", e);
    res.status(500).json({ message: "Gagal menghentikan bot." });
  }
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
