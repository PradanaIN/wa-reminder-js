const express = require('express');
const {
  handleLogin,
  handleLogout,
  handleSession,
} = require('../controllers/authController');

const router = express.Router();

router.post('/login', handleLogin);
router.post('/logout', handleLogout);
router.get('/session', handleSession);

module.exports = router;
