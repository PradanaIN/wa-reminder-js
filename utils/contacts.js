const path = require("path");
const { google } = require("googleapis");
const auth = new google.auth.GoogleAuth({
  keyFile: path.resolve(__dirname, "../config/sheets_service_account.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

async function loadContactsFromSheets() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: "1JXZtwjBfaJ2iNsuAk4Kh5gOw4o_hbIlk6Dyfvc4LJC4",
    range: "Sheet1!A2:C",
  });

  const rows = res.data.values;

  if (!rows || !rows.length) {
    console.log("[GoogleSheets] Tidak ada data.");
    return [];
  }

  return rows
    .filter((row) => row[2]?.toLowerCase() === "masuk" && row[1])
    .map(([name, number]) => ({ name, number }));
}

module.exports = { loadContactsFromSheets };
