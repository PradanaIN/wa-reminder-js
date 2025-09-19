const express = require('express');
const moment = require('moment-timezone');

const {
  renderLogin,
  handleLoginForm,
  handleLogoutWeb,
} = require('../controllers/authController');
const { getSchedule, getNextRun } = require('../services/scheduleService');
const { getLogs } = require('../controllers/logController');
const { isBotActive } = require('../controllers/botController');
const { TIMEZONE } = require('../utils/calendar');

const router = express.Router();

function requireAdminWeb(req, res, next) {
  if (!req.session?.isAdmin) {
    return res.redirect('/admin/login');
  }
  return next();
}

router.get('/', async (req, res, next) => {
  try {
    const schedule = await getSchedule();
    const nextRun = await getNextRun({ includeDetails: true });

    res.render('public/status', {
      botActive: isBotActive(),
      schedule,
      nextRun: nextRun?.targetMoment
        ? {
            formatted: nextRun.targetMoment.format('YYYY-MM-DD HH:mm'),
            timezone: schedule.timezone,
            override: nextRun.override,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/admin/login', renderLogin);
router.post('/admin/login', handleLoginForm);
router.post('/admin/logout', requireAdminWeb, handleLogoutWeb);

router.get('/admin/dashboard', requireAdminWeb, async (req, res, next) => {
  try {
    const schedule = await getSchedule();
    const nextRun = await getNextRun({ includeDetails: true });

    res.render('admin/dashboard', {
      username: req.session.username,
      botActive: isBotActive(),
      logs: getLogs(50),
      schedule,
      nextRun: nextRun?.targetMoment
        ? {
            formatted: nextRun.targetMoment.format('YYYY-MM-DD HH:mm'),
            timezone: schedule.timezone,
            override: nextRun.override,
          }
        : null,
      generatedAt: moment().tz(TIMEZONE).format('YYYY-MM-DD HH:mm'),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
