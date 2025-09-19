const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const path = require("path");

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
const CREDENTIALS_PATH = path.join(__dirname, "../config/calendar_oauth.json");
const TOKEN_PATH = path.join(__dirname, "../config/calendar_token.json");

function createOAuthClient() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

function promptForAuth(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });

  console.log("\n🔐 Buka URL ini di browser dan login:");
  console.log(authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question("\nMasukkan kode dari halaman Google: ", (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return reject(err);
        oAuth2Client.setCredentials(token);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
        console.log("✅ Token tersimpan di", TOKEN_PATH);
        resolve(oAuth2Client);
      });
    });
  });
}

async function authorize(forceLogin = false) {
  const oAuth2Client = createOAuthClient();

  if (!forceLogin && fs.existsSync(TOKEN_PATH)) {
    try {
      const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
      oAuth2Client.setCredentials(token);

      // Test token by calling a safe method
      const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
      await calendar.calendarList.list(); // dummy safe request
      return oAuth2Client;
    } catch (err) {
      console.warn("⚠️ Token rusak atau kadaluarsa:", err.message);
    }
  }

  // Fallback ke login ulang
  return await promptForAuth(oAuth2Client);
}

module.exports = { authorize };

if (require.main === module) {
  authorize()
    .then(() => {
      console.log("✅ Proses otorisasi selesai.");
    })
    .catch((err) => {
      console.error("❌ Gagal otorisasi:", err.message);
    });
}
