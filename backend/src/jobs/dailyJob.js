const moment = require('moment-timezone');
const {
  isWorkDayHybrid,
  TIMEZONE,
} = require('../utils/calendar');
const { sendMessagesToAll } = require('../controllers/messageController');
const {
  getNextRun,
  consumeManualOverride,
} = require('../services/scheduleService');
const config = require('../config/env');

let jobTimer = null;
let cachedClient = null;
let logger = console.log;

function setTimer(delay, handler) {
  if (jobTimer) {
    clearTimeout(jobTimer);
  }
  jobTimer = setTimeout(handler, delay);
}

async function planNextRun({ referenceMoment, reason = 'auto' } = {}) {
  if (!cachedClient) {
    logger('[Scheduler] WhatsApp client belum tersedia untuk menjadwalkan ulang.');
    return;
  }

  const now = moment().tz(TIMEZONE);
  const baseMoment = referenceMoment ? referenceMoment.clone() : now;

  try {
    const nextRun = await getNextRun({ referenceMoment: baseMoment });

    if (!nextRun || !nextRun.targetMoment) {
      logger('[Scheduler] Tidak ada jadwal aktif. Cek ulang dalam 1 jam.');
      setTimer(60 * 60 * 1000, () => planNextRun({ reason: 'idle-check' }));
      return;
    }

    const delayMs = Math.max(nextRun.targetMoment.diff(now), 0);
    logger(
      `[Scheduler] Menjadwalkan job berikutnya pada ${nextRun.targetMoment.format(
        'YYYY-MM-DD HH:mm:ss'
      )} (reason=${reason}, delay=${delayMs}ms)`
    );

    setTimer(delayMs, () => executeRun(nextRun));
  } catch (err) {
    logger(`[Scheduler] Gagal mendapatkan jadwal berikutnya: ${err.message}`);
    setTimer(config.scheduler.retryIntervalMs, () =>
      planNextRun({ reason: 'schedule-retry' })
    );
  }
}

async function executeRun(nextRun) {
  const client = cachedClient;
  if (!client) {
    logger('[Scheduler] WhatsApp client tidak tersedia saat eksekusi.');
    return;
  }

  const targetMoment = nextRun.targetMoment.clone();

  try {
    if (!nextRun.override) {
      const workday = await isWorkDayHybrid(logger, targetMoment);
      if (!workday) {
        logger(
          `[Scheduler] ${targetMoment.format('YYYY-MM-DD')} bukan hari kerja. Skip pengiriman.`
        );
        await planNextRun({
          referenceMoment: targetMoment.add(1, 'day'),
          reason: 'non-workday',
        });
        return;
      }
    }

    let attempts = 0;
    let state = null;
    while (attempts < config.scheduler.maxRetries) {
      state = await client.getState().catch((err) => {
        logger(
          `[Bot] Gagal cek client state (percobaan ${attempts + 1}): ${err.message}`
        );
        return null;
      });

      if (state === 'CONNECTED') {
        break;
      }

      attempts += 1;
      logger(
        `[Bot] Client tidak siap (state: ${state}). Ulangi dalam ${Math.round(
          config.scheduler.retryIntervalMs / 1000
        )} detik...`
      );
      await new Promise((res) => setTimeout(res, config.scheduler.retryIntervalMs));
    }

    if (state !== 'CONNECTED') {
      logger(
        `[Bot] Gagal menghubungi client setelah ${config.scheduler.maxRetries} percobaan. Menjadwalkan ulang.`
      );
      await planNextRun({
        referenceMoment: targetMoment.add(1, 'minute'),
        reason: 'client-disconnected',
      });
      return;
    }

    await sendMessagesToAll(client, logger);

    if (nextRun.override) {
      await consumeManualOverride(nextRun.override.date);
    }

    await planNextRun({
      referenceMoment: targetMoment.add(1, 'minute'),
      reason: 'completed',
    });
  } catch (err) {
    logger(`[Bot] Error saat menjalankan job: ${err.message}`);
    await planNextRun({
      referenceMoment: moment().tz(TIMEZONE).add(15, 'minutes'),
      reason: 'error',
    });
  }
}

async function runDailyJob(client, addLog = console.log) {
  cachedClient = client;
  logger = addLog;

  if (!cachedClient) {
    logger('[Bot] WhatsApp client tidak tersedia. Menunggu hingga siap.');
    return;
  }

  await planNextRun({ reason: 'initial' });
}

function cancelJob() {
  if (jobTimer) {
    clearTimeout(jobTimer);
    jobTimer = null;
  }
}

async function forceReschedule(reason = 'manual') {
  cancelJob();
  await planNextRun({ reason });
}

module.exports = {
  runDailyJob,
  forceReschedule,
  cancelJob,
};
