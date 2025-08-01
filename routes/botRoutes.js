const express = require("express");
const router = express.Router();
const {
  startBot,
  stopBot,
  isBotActive,
} = require("../controllers/botController");

// Menyalakan bot
router.post("/start", async (req, res, next) => {
  try {
    await startBot();
    res.json({ success: true, message: "Bot berhasil diaktifkan." });
  } catch (err) {
    next(err);
  }
});

// Mematikan bot
router.post("/stop", async (req, res, next) => {
  try {
    await stopBot();
    res.json({ success: true, message: "Bot berhasil dihentikan." });
  } catch (err) {
    next(err);
  }
});

// Mengecek status aktif bot
router.get("/status", (req, res) => {
  const status = isBotActive();
  res.json({ active: status });
});

module.exports = router;
