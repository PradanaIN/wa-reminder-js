const fs = require('fs');
const path = require('path');
const { runDailyJob, cancelJob, forceReschedule } = require('../jobs/dailyJob');
const { getSchedule } = require('../services/scheduleService');

let schedulerActive = false;
let scheduleWatcher = null;

function getSchedulePath() {
  return path.join(__dirname, '..', '..', 'storage', 'schedule-config.json');
}

async function watchScheduleFile(addLog) {
  const schedulePath = getSchedulePath();

  if (scheduleWatcher) {
    scheduleWatcher.close();
  }

  try {
    await getSchedule();
    scheduleWatcher = fs.watch(schedulePath, { persistent: false }, () => {
      addLog('[Scheduler] Perubahan jadwal terdeteksi. Menyusun ulang job.');
      forceReschedule('file-watch');
    });
  } catch (err) {
    addLog(`[Scheduler] Tidak dapat memantau file jadwal: ${err.message}`);
  }
}

function startScheduler(client, addLog) {
  if (schedulerActive) {
    addLog('[Scheduler] Scheduler sudah aktif.');
    return;
  }

  schedulerActive = true;
  addLog('[Scheduler] Menyalakan scheduler harian dinamis...');
  runDailyJob(client, addLog);
  watchScheduleFile(addLog);
}

function stopScheduler(addLog) {
  if (!schedulerActive) {
    addLog('[Scheduler] Tidak ada scheduler aktif.');
    return;
  }

  schedulerActive = false;
  if (scheduleWatcher) {
    scheduleWatcher.close();
    scheduleWatcher = null;
  }

  cancelJob();
  addLog('[Scheduler] Scheduler dihentikan.');
}

module.exports = {
  startScheduler,
  stopScheduler,
  forceReschedule,
};
