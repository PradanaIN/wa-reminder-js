const express = require('express');
const { startBot, stopBot, isBotActive } = require('../controllers/botController');

const router = express.Router();

router.post('/start', async (req, res, next) => {
  try {
    await startBot();
    res.json({ active: isBotActive(), message: 'Bot berhasil diaktifkan.' });
  } catch (err) {
    next(err);
  }
});

router.post('/stop', async (req, res, next) => {
  try {
    await stopBot();
    res.json({ active: isBotActive(), message: 'Bot berhasil dihentikan.' });
  } catch (err) {
    next(err);
  }
});

router.get('/status', (req, res) => {
  res.json({ active: isBotActive() });
});

module.exports = router;
