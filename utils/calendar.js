const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");
const { getTodayIsHoliday } = require("../services/calendarHoliday");

const TIMEZONE = "Asia/Makassar";

// Muat data libur dari file eksternal
let LIBURAN = new Set();
let CUTI_BERSAMA = new Set();

function loadLocalHolidays() {
  try {
    const raw = fs.readFileSync(
      path.join(__dirname, "..", "templates", "calendar_local.json"),
      "utf-8"
    );
    const parsed = JSON.parse(raw);
    LIBURAN = new Set(parsed.LIBURAN);
    CUTI_BERSAMA = new Set(parsed.CUTI_BERSAMA);
    // console.log("[Calendar] ✅ Data hari libur lokal berhasil dimuat.");
  } catch (err) {
    console.error(
      "[Calendar] ❌ Gagal memuat data calendar_local.json:",
      err.message
    );
  }
}

// Jalankan sekali saat load awal
loadLocalHolidays();

// Internal lock dan cache
let isChecking = false;
const workdayCache = {}; // cache[YYYY-MM-DD] = true/false

function isWorkDay(date = moment().tz(TIMEZONE), addLog = () => {}) {
  const todayStr = date.format("YYYY-MM-DD");
  const weekday = date.weekday();

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

function isWeekend(date) {
  const day = date.isoWeekday(); // Senin=1 ... Minggu=7
  return day === 6 || day === 7; // Sabtu atau Minggu
}

async function isWorkDayHybrid(
  addLog = () => {},
  date = moment().tz(TIMEZONE)
) {
  const todayStr = date.format("YYYY-MM-DD");

  if (todayStr in workdayCache) {
    addLog(`[Calendar] 🧠 Menggunakan cache untuk ${todayStr}`);
    return workdayCache[todayStr];
  }

  if (isWeekend(date)) {
    addLog(`[Calendar] ${todayStr} adalah akhir pekan (Sabtu/Minggu).`);
    workdayCache[todayStr] = false;
    return false;
  }

  if (isChecking) {
    addLog(`[Calendar] ⏳ Sedang mengecek kalender, tunggu...`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (todayStr in workdayCache) {
      addLog(`[Calendar] 🧠 Cache tersedia setelah tunggu untuk ${todayStr}`);
      return workdayCache[todayStr];
    }
  }

  isChecking = true;
  try {
    const events = await getTodayIsHoliday(date.toDate());
    if (events.length > 0) {
      addLog(
        `[Calendar] ${todayStr} ditemukan libur (Google Calendar): ${events
          .map((e) => e.summary)
          .join(", ")}`
      );
      workdayCache[todayStr] = false;
      return false;
    }
    addLog(`[Calendar] ${todayStr} adalah hari kerja (Google Calendar).`);
    workdayCache[todayStr] = true;
    return true;
  } catch (err) {
    addLog(
      `[Calendar] ⚠️ Gagal mengakses Google Calendar. Gunakan data lokal sebagai fallback.`
    );
    addLog(`[Calendar] Error: ${err.message}`);
  } finally {
    isChecking = false;
  }

  const localResult = isWorkDay(date, addLog);
  workdayCache[todayStr] = localResult;
  return localResult;
}

async function getNextWorkDay(
  startDate = moment().tz(TIMEZONE),
  addLog = () => {}
) {
  let date = startDate.clone().add(1, "day");

  while (true) {
    if (isWeekend(date)) {
      addLog(
        `[Calendar] ${date.format("YYYY-MM-DD")} adalah akhir pekan. Lewati.`
      );
      date.add(1, "day");
      continue;
    }

    const tempLog = [];
    const isWork = await isWorkDayHybrid((msg) => tempLog.push(msg), date);

    if (isWork) {
      tempLog.forEach(addLog);
      addLog(`[Calendar] Hari kerja berikutnya: ${date.format("YYYY-MM-DD")}`);
      return date;
    }

    date.add(1, "day");
  }
}

function clearCalendarCache() {
  Object.keys(workdayCache).forEach((key) => delete workdayCache[key]);
  console.log("[Calendar] 🔄 Cache kalender telah direset.");
}

module.exports = {
  isWorkDay,
  isWorkDayHybrid,
  getNextWorkDay,
  clearCalendarCache,
  TIMEZONE,
};
