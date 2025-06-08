const moment = require("moment-timezone");
const { getTodayIsHoliday } = require("../services/calendarHoliday");

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
 * Cek apakah tanggal tertentu adalah hari kerja berdasarkan hardcoded
 * @param {moment.Moment} date
 * @param {Function} addLog
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
    addLog(`[Calendar] ${todayStr} adalah hari libur/cuti bersama (lokal).`);
    return false;
  }

  addLog(`[Calendar] ${todayStr} adalah hari kerja (lokal).`);
  return true;
}

/**
 * Versi hybrid: kombinasi lokal dan Google Calendar
 * @param {Function} addLog - fungsi logging opsional
 * @returns {Promise<boolean>}
 */
async function isWorkDayHybrid(addLog = () => {}) {
  const now = moment().tz(TIMEZONE);

  if (!isWorkDay(now, addLog)) {
    return false;
  }

  try {
    const events = await getTodayIsHoliday();
    if (events.length > 0) {
      addLog(
        `[Calendar] ${now.format(
          "YYYY-MM-DD"
        )} ditemukan libur dari Google Calendar: ${events
          .map((e) => e.summary)
          .join(", ")}`
      );
      return false;
    }
  } catch (err) {
    addLog(
      `[Calendar] ⚠️ Gagal mengakses Google Calendar. Mengandalkan data lokal.`
    );
  }

  return true;
}

module.exports = { isWorkDay, isWorkDayHybrid, TIMEZONE };
