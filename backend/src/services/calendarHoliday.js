const { google } = require("googleapis");
const { authorize } = require("./calendarAuth");

/**
 * Ambil event hari libur untuk tanggal tertentu (default: hari ini)
 * @param {Date} [date=new Date()]
 * @returns {Promise<Array>}
 */
async function getTodayIsHoliday(date = new Date()) {
  const auth = await authorize();
  const calendar = google.calendar({ version: "v3", auth });

  // Buat rentang waktu dari jam 00:00 sampai 23:59 tanggal tsb
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const res = await calendar.events.list({
    calendarId: "en.indonesian#holiday@group.v.calendar.google.com",
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  return res.data.items;
}

module.exports = { getTodayIsHoliday };
