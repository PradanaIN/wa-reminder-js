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
let isRestarting = false;
let isClientReady = false;
let statusCheckerInterval = null;

async function startBot() {
  if (client) {
    addLog("[Sistem] ⚠️ Bot sudah aktif.");
    return;
  }

  const puppeteerOptions = {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    puppeteerOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: path.join(__dirname, "..", "..", "storage", "sessions"),
    }),
    puppeteer: puppeteerOptions,
  });

  client.on("qr", (qr) => {
    if (latestQR !== qr) {
      latestQR = qr;
      qrcode.generate(qr, { small: true });
      addLog("📱 Scan QR code ini dengan WhatsApp Anda.");
      emitQrUpdate(qr);
    }
  });

  client.on("ready", async () => {
    botActive = true;
    isClientReady = true;
    addLog("[Bot] ✅ WhatsApp Client is ready!");
    emitStatusUpdate(true);

    startClientStatusChecker(); // ✅ Auto-check client status

    try {
      await runDailyJob(client, addLog);
    } catch (err) {
      addLog(`[Startup Job] Gagal job harian: ${err.message}`);
    }

    startScheduler(client, addLog);
  });

  client.on("auth_failure", async () => {
    addLog("[Sistem] ❌ Autentikasi gagal. Reset sesi...");
    const fs = require("fs");
    const sessionPath = path.join(__dirname, "..", "..", "storage", "sessions");
    fs.rmSync(sessionPath, { recursive: true, force: true });
    client = null;
    botActive = false;
    isClientReady = false;
    emitStatusUpdate(false);
  });

  client.on("disconnected", async (reason) => {
    if (isRestarting) return;
    isRestarting = true;

    addLog(`[Sistem] ⚠️ Client disconnected: ${reason}. Mencoba restart...`);
    client = null;
    botActive = false;
    isClientReady = false;
    latestQR = null;
    emitStatusUpdate(false);

    try {
      await startBot();
    } catch (err) {
      addLog(`[Sistem] ❌ Gagal restart bot: ${err.message}`);
    } finally {
      isRestarting = false;
    }
  });

  try {
    addLog("[Sistem] 🔄 Inisialisasi WhatsApp client...");
    await client.initialize();
    addLog("[Sistem] ✅ Bot aktif.");
  } catch (err) {
    addLog(`[Sistem] ❌ Gagal inisialisasi client: ${err.message}`);
    client = null;
    botActive = false;
    isClientReady = false;
    emitStatusUpdate(false);
  }
}

async function stopBot(
  logParts = { scheduler: true, heartbeat: true, bot: true }
) {
  if (!client) {
    if (logParts.bot) addLog("[Sistem] ⚠️ Bot belum aktif.");
    return;
  }

  try {
    if (logParts.scheduler) await stopScheduler(addLog);
    if (logParts.heartbeat) {
      addLog("[Sistem] 💓 Menghentikan heartbeat...");
      stopHeartbeat();
    }

    stopClientStatusChecker(); // ✅ Hentikan pengecekan silent crash

    await client.destroy();
    client = null;
    latestQR = null;
    botActive = false;
    isClientReady = false;

    if (logParts.bot) addLog("[Sistem] 🤖 Bot dinonaktifkan.");
    emitStatusUpdate(false);
  } catch (err) {
    addLog(`[Sistem] ❌ Gagal stop bot: ${err.message}`);
    throw err;
  }
}

function startClientStatusChecker(intervalMs = 60000) {
  if (statusCheckerInterval) clearInterval(statusCheckerInterval);

  statusCheckerInterval = setInterval(async () => {
    if (!client) return;

    try {
      const state = await client.getState();
      if (state !== "CONNECTED") {
        addLog(`[Sistem] ⚠️ Client state: ${state}. Restarting bot...`);
        await stopBot({ scheduler: false, heartbeat: false, bot: true });
        await startBot();
      }
    } catch (err) {
      addLog(`[Sistem] ❌ Gagal cek client state: ${err.message}`);
      await stopBot({ scheduler: false, heartbeat: false, bot: true });
      await startBot();
    }
  }, intervalMs);
}

function stopClientStatusChecker() {
  if (statusCheckerInterval) {
    clearInterval(statusCheckerInterval);
    statusCheckerInterval = null;
  }
}

function getQR() {
  return latestQR;
}

function getClient() {
  return isClientReady && client ? client : null;
}

function isBotActive() {
  return botActive;
}

module.exports = {
  startBot,
  stopBot,
  getQR,
  getClient,
  isBotActive,
};
