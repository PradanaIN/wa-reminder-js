const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const path = require("path");
const { runDailyJob } = require("../jobs/dailyJob");
const { startScheduler, stopScheduler } = require("./schedulerController");
const { stopHeartbeat } = require("../utils/heartbeat");
const { addLog } = require("./logController");
const { emitStatusUpdate, emitQrUpdate } = require("../utils/socketHandler");

let client = null;
let latestQR = null;
let botActive = false;

async function startBot() {
  if (client) {
    addLog("[Sistem] ⚠️ Bot sudah aktif.");
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
      emitQrUpdate(qr); // <-- Emit QR ke client
    }
  });

  client.on("ready", async () => {
    botActive = true;
    addLog("[Bot] ✅ WhatsApp Client is ready!");
    emitStatusUpdate(true); // <-- Emit status aktif ke client

    try {
      await runDailyJob(client, addLog);
    } catch (err) {
      addLog(`[Startup Job] Gagal menjalankan job harian: ${err.message}`);
    }
    startScheduler(client, addLog, () => botActive);
  });

  client.on("auth_failure", async () => {
    addLog("[Sistem] ❌ Autentikasi gagal. Menghapus sesi dan mengulang...");
    const fs = require("fs");
    const sessionPath = path.join(__dirname, "..", "sessions");
    fs.rmSync(sessionPath, { recursive: true, force: true });
    client = null;
    botActive = false;
    emitStatusUpdate(false); // <-- Emit status nonaktif
  });

  client.on("disconnected", async (reason) => {
    addLog(
      `[Sistem] ⚠️ Client disconnected: ${reason}. Mencoba restart bot...`
    );
    botActive = false;
    latestQR = null;
    client = null;
    emitStatusUpdate(false); // <-- Emit status nonaktif
    try {
      await startBot();
    } catch (err) {
      addLog(`[Sistem] ❌ Gagal restart bot: ${err.message}`);
    }
  });

  addLog("[Sistem] 🔄 Menginisialisasi WhatsApp client...");

  try {
    await client.initialize();
  } catch (err) {
    addLog(`[Sistem] ❌ Gagal inisialisasi WhatsApp client: ${err.message}`);
    console.error(err);
    client = null;
    botActive = false;
    emitStatusUpdate(false);
    return;
  }
  addLog("[Sistem] ✅ Bot berhasil diaktifkan.");
}

/**
 * Hentikan bot, scheduler, dan heartbeat.
 * @param {Object} logParts - Pengaturan log: { scheduler: true, heartbeat: true, bot: true }
 */
async function stopBot(
  logParts = { scheduler: true, heartbeat: true, bot: true }
) {
  if (!client) {
    if (logParts.bot) addLog("[Sistem] ⚠️ Bot belum aktif.");
    return;
  }

  try {
    // Stop scheduler
    if (stopScheduler.constructor.name === "AsyncFunction") {
      await stopScheduler(logParts.scheduler ? addLog : () => {});
    } else {
      stopScheduler(logParts.scheduler ? addLog : () => {});
    }

    // Stop heartbeat
    if (logParts.heartbeat) addLog("[Sistem] 💓 Menghentikan heartbeat...");
    stopHeartbeat();
    if (logParts.heartbeat)
      addLog("[Sistem] 💓 Heartbeat berhasil dihentikan.");

    // Stop bot client
    await client.destroy();
    client = null;
    latestQR = null;
    botActive = false;

    if (logParts.bot) addLog("[Sistem] 🤖 Bot dinonaktifkan.");
    emitStatusUpdate(false);
  } catch (err) {
    addLog(`[Sistem] ❌ Gagal menghentikan bot: ${err.message}`);
    throw err;
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
