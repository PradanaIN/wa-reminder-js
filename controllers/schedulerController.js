const moment = require("moment-timezone");
const schedule = require("node-schedule");
const { runDailyJob } = require("../jobs/dailyJob");
const { startHeartbeat } = require("../utils/heartbeat");
const { isWorkDayHybrid, TIMEZONE } = require("../utils/calendar");

let scheduledJob = null;

function startScheduler(client, addLog, isBotActiveRef) {
  if (scheduledJob) {
    addLog("[Scheduler] ❗ Job sudah dijadwalkan. Tidak menjadwalkan ulang.");
    return;
  }

  // Inisialisasi heartbeat
  startHeartbeat(addLog, TIMEZONE, moment);

  // Ambil waktu dari .env, default 15:00
  const timeParts = process.env.JOB_TIME?.split(":") || ["15", "00"];
  const hour = parseInt(timeParts[0], 10) || 15;
  const minute = parseInt(timeParts[1], 10) || 0;

  const rule = new schedule.RecurrenceRule();
  rule.tz = TIMEZONE;
  rule.hour = hour;
  rule.minute = minute;

  const jadwalText = moment()
    .tz(TIMEZONE)
    .hour(hour)
    .minute(minute)
    .second(0)
    .format("YYYY-MM-DD HH:mm:ss");

  // Jadwalkan job harian
  scheduledJob = schedule.scheduleJob(rule, async () => {
    const now = moment().tz(TIMEZONE).format("YYYY-MM-DD HH:mm:ss");
    addLog(`[Scheduler] ⏰ Menjalankan job pada ${now}`);

    try {
      if (isBotActiveRef()) {
        const isWorkday = await isWorkDayHybrid(addLog);
        if (isWorkday) {
          await runDailyJob(client, addLog);
        } else {
          addLog("[Scheduler] 📅 Hari ini bukan hari kerja, job dilewati.");
        }
      } else {
        addLog("[Scheduler] ⛔ Bot sedang nonaktif, job dilewati.");
      }
    } catch (err) {
      addLog(`[Scheduler] ❌ Error saat menjalankan job: ${err.message}`);
    }
  });

  addLog(
    `[Scheduler] ✅ Job harian dijadwalkan pada ${jadwalText} (${TIMEZONE})`
  );
}

function stopScheduler(addLog) {
  if (scheduledJob) {
    scheduledJob.cancel();
    scheduledJob = null;
    addLog("[Scheduler] ⏹️ Job scheduler dibatalkan.");
  } else {
    addLog("[Scheduler] ⚠️ Tidak ada job scheduler yang aktif.");
  }
}

module.exports = {
  startScheduler,
  stopScheduler,
};
