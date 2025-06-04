const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const path = require("path");
const { runDailyJob } = require("../jobs/dailyJob");
const { startScheduler, stopScheduler } = require("./schedulerController");
const { addLog } = require("./logController");

let client = null;
let latestQR = null;
let botActive = false;

async function startBot() {
  if (client) {
    addLog("⚠️ Bot sudah aktif.");
    return;
  }

  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: path.join(__dirname, "..", "sessions"),
    }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  client.on("qr", (qr) => {
    if (latestQR !== qr) {
      latestQR = qr;
      qrcode.generate(qr, { small: true });
      addLog("📱 Scan QR code ini dengan WhatsApp Anda.");
    }
  });

  client.on("ready", async () => {
    addLog("✅ WhatsApp Client is ready!");
    try {
      await runDailyJob(client, addLog);
    } catch (err) {
      addLog(`[Startup Job] Gagal menjalankan job harian: ${err.message}`);
    }
    startScheduler(client, addLog, () => botActive);
  });

  client.on("auth_failure", (msg) => addLog(`❌ Autentikasi gagal: ${msg}`));
  client.on("disconnected", async (reason) => {
    addLog(`⚠️ Client disconnected: ${reason}`);
    await stopBot();
  });

  addLog("🔄 Menginisialisasi WhatsApp client...");
  await client.initialize();
  botActive = true;
  addLog("✅ Bot berhasil diaktifkan.");
}

async function stopBot() {
  if (!client) {
    addLog("⚠️ Bot belum aktif.");
    return;
  }

  try {
    stopScheduler(addLog);
    await client.destroy();
    client = null;
    latestQR = null;
    botActive = false;
    addLog("🛑 Bot dinonaktifkan dan WhatsApp client dihentikan.");
  } catch (err) {
    addLog(`❌ Gagal menghentikan bot: ${err.message}`);
  }
}

function getQR() {
  return latestQR;
}

function getClient() {
  return client;
}

function isBotActive() {
  return botActive;
}

module.exports = { startBot, stopBot, getQR, getClient, isBotActive };
