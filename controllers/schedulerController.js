const moment = require("moment-timezone");
const { runDailyJob } = require("../jobs/dailyJob");
const { startHeartbeat } = require("../utils/heartbeat");
const { isWorkDayHybrid, TIMEZONE } = require("../utils/calendar");

let jobInterval = null;

function startScheduler(client, addLog, isBotActiveRef) {
  if (jobInterval) {
    addLog("[Scheduler] Scheduler sudah berjalan.");
    return;
  }

  // addLog("[Scheduler] Menjalankan job harian tiap 20 jam.");
  startHeartbeat(addLog, TIMEZONE, moment);

  jobInterval = setInterval(async () => {
    const now = moment().tz(TIMEZONE).format("YYYY-MM-DD HH:mm:ss");
    addLog(`[Scheduler] Mengecek jadwal job (${now})`);

    try {
      if (isBotActiveRef()) {
        if (await isWorkDayHybrid(addLog)) {
          await runDailyJob(client, addLog);
        } else {
          addLog("[Scheduler] Melewati job karena bukan hari kerja.");
        }
      } else {
        addLog("[Scheduler] Bot sedang NONAKTIF. Job dilewati.");
      }
    } catch (err) {
      addLog(`[Scheduler] Error saat menjalankan job: ${err.message}`);
    }
  }, 20 * 60 * 60 * 1000); // 20 jam
}

function stopScheduler(addLog) {
  if (jobInterval) {
    addLog("[Sistem] ⏹️ Menghentikan scheduler...");
    clearInterval(jobInterval);
    jobInterval = null;
    addLog("[Sistem] ⏹️ Scheduler berhasil dihentikan.");
  } else {
    addLog("[Sistem] ⏹️ Scheduler berhasil dihentikan.");
  }
}

module.exports = { startScheduler, stopScheduler };
