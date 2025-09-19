const path = require("path");
const { google } = require("googleapis");
require("dotenv").config();

const auth = new google.auth.GoogleAuth({
  keyFile: path.resolve(__dirname, "../config/sheets_service_account.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

function sanitizeNumber(number) {
  return number.replace(/[^\d]/g, "").replace(/^0/, "62");
}

function isValidWaNumber(number) {
  return /^\d{9,15}$/.test(number);
}

async function loadContactsFromSheets() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = process.env.SPREADSHEET_ID;
  const range = process.env.SPREADSHEET_RANGE || "Sheet1!A2:C";

  if (!spreadsheetId) {
    console.error("[GoogleSheets] ❌ SPREADSHEET_ID tidak ditemukan di .env");
    return [];
  }

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = res.data.values;

  if (!rows || !rows.length) {
    console.log("[GoogleSheets] Tidak ada data.");
    return [];
  }

  return rows
    .filter((row) => row[2]?.toLowerCase() === "masuk" && row[1])
    .map(([name, number]) => {
      const cleanNumber = sanitizeNumber(number);
      return { name, number: cleanNumber };
    })
    .filter((c) => isValidWaNumber(c.number));
}

module.exports = { loadContactsFromSheets };
