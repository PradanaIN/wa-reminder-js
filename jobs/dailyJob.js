const moment = require("moment-timezone");
const { checkWorkDay } = require("../controllers/scheduler");
const { sendMessagesToAll } = require("../controllers/sender");

const TIMEZONE = "Asia/Makassar";

async function runDailyJob(client, addLog = console.log) {
  addLog("🚀 Memulai job harian...");

  const now = moment().tz(TIMEZONE);
  const weekday = now.isoWeekday();

  const isWorkDay = await checkWorkDay();
  if (!isWorkDay) {
    addLog(
      `Hari ini (${now.format(
        "YYYY-MM-DD"
      )}) bukan hari kerja. Tidak mengirim pesan.`
    );
    return;
  }

  let targetHour, targetMinute;
  if ([1, 2, 3, 4].includes(weekday)) {
    targetHour = 10;
    targetMinute = 20;
  } else if (weekday === 5) {
    targetHour = 16;
    targetMinute = 29;
  } else {
    addLog("Hari ini bukan hari kerja (Sabtu/Minggu).");
    return;
  }

  let targetTime = now
    .clone()
    .hour(targetHour)
    .minute(targetMinute)
    .second(30)
    .millisecond(0);

  if (now.isAfter(targetTime)) {
    addLog("Waktu pengiriman sudah lewat hari ini, menunggu keesokan hari...");
    return;
  }

  const delayMs = targetTime.diff(now);
  addLog(
    `Menunggu sampai waktu pengiriman: ${targetTime.format(
      "YYYY-MM-DD HH:mm:ss"
    )}`
  );

  await new Promise((resolve) => setTimeout(resolve, delayMs));

  await sendMessagesToAll(client, addLog);

  addLog("✅ Selesai mengirim semua pesan.");
}

module.exports = { runDailyJob };
