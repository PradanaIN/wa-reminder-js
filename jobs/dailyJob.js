const moment = require("moment-timezone");
const {
  isWorkDayHybrid,
  getNextWorkDay,
  TIMEZONE,
} = require("../utils/calendar");
const { sendMessagesToAll } = require("../controllers/messageController");

let jobTimer = null;

async function runDailyJob(client, addLog = console.log) {
  try {
    addLog("[Bot] 🚀 Memulai job harian...");

    if (!client) {
      addLog(
        "[Bot] ❌ WhatsApp Client tidak tersedia. Kirim pesan dibatalkan."
      );
      return;
    }

    const now = moment().tz(TIMEZONE);
    const weekday = now.isoWeekday();

    const isWorkDayToday = await isWorkDayHybrid(addLog, now);
    if (!isWorkDayToday) {
      addLog(
        `[Bot] 📅 Hari ini (${now.format("YYYY-MM-DD")}) bukan hari kerja.`
      );
      await scheduleNext(client, addLog);
      return;
    }

    const targetHour = [1, 2, 3, 4].includes(weekday) ? 15 : 16;
    const targetMinute = [1, 2, 3, 4].includes(weekday) ? 59 : 29;

    const targetTime = now
      .clone()
      .hour(targetHour)
      .minute(targetMinute)
      .second(30)
      .millisecond(0);

    if (now.isAfter(targetTime)) {
      addLog(
        `[Bot] ⚠️ Sudah lewat waktu kirim (${targetTime.format("HH:mm")})`
      );
      await scheduleNext(client, addLog);
      return;
    }

    const delayMs = targetTime.diff(now);
    addLog(
      `[Bot] ⏳ Menunggu hingga ${targetTime.format(
        "YYYY-MM-DD HH:mm:ss"
      )} (${delayMs}ms)`
    );

    if (jobTimer) clearTimeout(jobTimer);

    jobTimer = setTimeout(async () => {
      let attempts = 0;
      const maxRetries = 3;
      let state = null;

      while (attempts < maxRetries) {
        state = await client.getState().catch((err) => {
          addLog(
            `[Bot] ⚠️ Gagal cek client state (percobaan ${attempts + 1}): ${
              err.message
            }`
          );
          return null;
        });

        if (state === "CONNECTED") break;

        addLog(
          `[Bot] ⚠️ Client tidak siap (state: ${state}). Ulangi dalam 60 detik...`
        );
        await new Promise((res) => setTimeout(res, 60 * 1000)); // 1 menit
        attempts++;
      }

      if (state !== "CONNECTED") {
        addLog(
          `[Bot] ❌ Gagal kirim pesan setelah ${maxRetries} percobaan. Lanjutkan ke hari berikutnya.`
        );
        await scheduleNext(client, addLog);
        return;
      }

      try {
        await sendMessagesToAll(client, addLog);
      } catch (err) {
        addLog(`[Bot] ❌ Gagal kirim pesan: ${err.message}`);
      }

      await scheduleNext(client, addLog);
    }, delayMs);
  } catch (err) {
    addLog(`[Bot] ❌ Error job harian: ${err.message}`);
    await scheduleNext(client, addLog);
  }
}

async function scheduleNext(client, addLog) {
  const nextWorkDay = await getNextWorkDay(moment().tz(TIMEZONE), addLog);
  const weekday = nextWorkDay.isoWeekday();

  const targetHour = [1, 2, 3, 4].includes(weekday) ? 16 : 16;
  const targetMinute = [1, 2, 3, 4].includes(weekday) ? 4 : 29;

  const targetTime = nextWorkDay
    .clone()
    .hour(targetHour)
    .minute(targetMinute)
    .second(30)
    .millisecond(0);

  const delayMs = targetTime.diff(moment().tz(TIMEZONE));

  addLog(
    `[Bot] 🔁 Menjadwalkan pengiriman selanjutnya: ${targetTime.format(
      "YYYY-MM-DD HH:mm:ss"
    )} (${delayMs}ms)`
  );

  if (jobTimer) clearTimeout(jobTimer);

  jobTimer = setTimeout(() => {
    runDailyJob(client, addLog);
  }, delayMs);
}

module.exports = { runDailyJob };
