const { google } = require("googleapis");
const { authorize } = require("./calendarAuth");

async function getTodayIsHoliday() {
  const auth = await authorize();
  const calendar = google.calendar({ version: "v3", auth });

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const res = await calendar.events.list({
    calendarId: "en.indonesian#holiday@group.v.calendar.google.com",
    timeMin: now.toISOString(),
    timeMax: tomorrow.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  return res.data.items;
}

module.exports = { getTodayIsHoliday };
