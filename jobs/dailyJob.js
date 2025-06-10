const moment = require("moment-timezone");
const { isWorkDayHybrid, TIMEZONE } = require("../utils/calendar");
const { sendMessagesToAll } = require("../controllers/messageController");

async function runDailyJob(client, addLog = console.log) {
  addLog("[Bot] 🚀 Memulai job harian...");

  const now = moment().tz(TIMEZONE);
  const weekday = now.isoWeekday();

  const isWorkDayToday = await isWorkDayHybrid(addLog);
  if (!isWorkDayToday) {
    addLog(
      `[Bot] Hari ini (${now.format(
        "YYYY-MM-DD"
      )}) bukan hari kerja. Tidak mengirim pesan.`
    );
    return;
  }

  let targetHour, targetMinute;
  if ([1, 2, 3, 4].includes(weekday)) {
    targetHour = 15;
    targetMinute = 29;
  } else if (weekday === 5) {
    targetHour = 16;
    targetMinute = 29;
  } else {
    addLog("[Bot] Hari ini bukan hari kerja (Sabtu/Minggu).");
    return;
  }

  let targetTime = now
    .clone()
    .hour(targetHour)
    .minute(targetMinute)
    .second(30)
    .millisecond(0);

  if (now.isAfter(targetTime)) {
    addLog(
      "[Bot] Waktu pengiriman sudah lewat hari ini, menunggu keesokan hari..."
    );
    return;
  }

  const delayMs = targetTime.diff(now);
  addLog(
    `[Bot] Menunggu sampai waktu pengiriman: ${targetTime.format(
      "YYYY-MM-DD HH:mm:ss"
    )}`
  );

  await new Promise((resolve) => setTimeout(resolve, delayMs));

  await sendMessagesToAll(client, addLog);

  addLog("[Bot] ✅ Selesai mengirim semua pesan.");
}

module.exports = { runDailyJob };
