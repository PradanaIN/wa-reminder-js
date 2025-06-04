const moment = require("moment-timezone");

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

/**
 * Mengecek apakah hari ini hari kerja (bukan weekend, libur, atau cuti bersama)
 * @param {moment.Moment} date - Tanggal yang dicek (default: sekarang)
 * @param {Function} addLog - Fungsi logging opsional
 * @returns {boolean}
 */
function isWorkDay(date = moment().tz(TIMEZONE), addLog = () => {}) {
  const todayStr = date.format("YYYY-MM-DD");
  const weekday = date.weekday(); // 0 = Minggu, 6 = Sabtu

  if (weekday === 0 || weekday === 6) {
    addLog(`[Calendar] ${todayStr} adalah weekend.`);
    return false;
  }

  if (LIBURAN.has(todayStr) || CUTI_BERSAMA.has(todayStr)) {
    addLog(`[Calendar] ${todayStr} adalah hari libur/cuti bersama.`);
    return false;
  }

  addLog(`[Calendar] ${todayStr} adalah hari kerja.`);
  return true;
}

module.exports = { isWorkDay, TIMEZONE };
