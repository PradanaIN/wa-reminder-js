const moment = require("moment-timezone");
const fs = require("fs");
const path = require("path");

// Set tanggal libur dan cuti bersama (format YYYY-MM-DD)
const LIBURAN = new Set([
  "2025-01-01",
  "2025-01-27",
  "2025-01-29",
  "2025-03-29",
  "2025-03-31",
  "2025-04-01",
  "2025-04-18",
  "2025-04-20",
  "2025-05-01",
  "2025-05-12",
  "2025-05-29",
  "2025-06-01",
  "2025-06-06",
  "2025-06-27",
  "2025-08-17",
  "2025-09-05",
  "2025-12-25",
]);

const CUTI_BERSAMA = new Set([
  "2025-01-28",
  "2025-03-28",
  "2025-04-02",
  "2025-04-03",
  "2025-04-04",
  "2025-04-07",
  "2025-05-13",
  "2025-05-30",
  "2025-06-09",
  "2025-12-26",
]);

const TIMEZONE = "Asia/Makassar";

async function checkWorkDay() {
  const todayStr = moment().tz(TIMEZONE).format("YYYY-MM-DD");
  const weekday = moment().tz(TIMEZONE).weekday(); // 0=Sun ... 6=Sat

  // Minggu (0) dan Sabtu (6) bukan hari kerja
  if (weekday === 0 || weekday === 6) {
    console.log(`[Scheduler] Hari ini (${todayStr}) adalah weekend.`);
    return false;
  }

  if (LIBURAN.has(todayStr) || CUTI_BERSAMA.has(todayStr)) {
    console.log(
      `[Scheduler] Hari ini (${todayStr}) termasuk libur nasional atau cuti bersama.`
    );
    return false;
  }

  console.log(`[Scheduler] Hari ini (${todayStr}) adalah hari kerja.`);
  return true;
}

module.exports = { checkWorkDay };
