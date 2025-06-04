const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const path = require("path");
const moment = require("moment-timezone");

const { runDailyJob } = require("./jobs/dailyJob");

const app = express();
const port = 3000;

app.use(express.json());

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: path.join(__dirname, "sessions"),
  }),
});

let jobStarted = false;

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("📱 Scan QR code ini dengan WhatsApp Anda.");
});

client.on("ready", async () => {
  console.log("✅ WhatsApp Client is ready!");

  if (!jobStarted) {
    jobStarted = true;

    // Jalankan job harian sekali pada startup
    try {
      await runDailyJob(client);
    } catch (err) {
      console.error(
        "[Startup Job] Gagal menjalankan runDailyJob:",
        err.message
      );
    }

    // Jadwalkan job harian tiap 23 jam (atau sesuai kebutuhan)
    setInterval(async () => {
      console.log(
        `[⏰] Mengecek dan menjalankan job harian (${moment().format(
          "YYYY-MM-DD HH:mm:ss"
        )})`
      );
      try {
        await runDailyJob(client);
      } catch (err) {
        console.error("[runDailyJob] Error:", err.message);
      }
    }, 20 * 60 * 60 * 1000);

    // Jadwalkan heartbeat log tiap 5 menit
    setInterval(() => {
      console.log(`[💓] Bot aktif - ${moment().format("YYYY-MM-DD HH:mm:ss")}`);
    }, 5 * 60 * 1000);
  }
});

client.initialize().catch((err) => {
  console.error("❌ Gagal menginisialisasi WhatsApp Client:", err.message);
});

app.post("/send", async (req, res) => {
  const { number, message } = req.body;
  try {
    const chatId = number.includes("@c.us") ? number : `${number}@c.us`;
    await client.sendMessage(chatId, message);
    res.send({ success: true, message: "Pesan terkirim!" });
  } catch (e) {
    res.status(500).send({ success: false, error: e.message });
  }
});

app.get("/status", (req, res) => {
  const status = client.info ? "Connected" : "Disconnected";
  res.send({ status });
});

// Endpoint keepalive untuk ping dari cron job eksternal
app.get("/keepalive", (req, res) => {
  console.log(`[KeepAlive] Ping diterima pada ${new Date().toISOString()}`);
  res.send({ status: "alive" });
});

app.listen(port, () => {
  console.log(`🖥️ Server berjalan di http://localhost:${port}`);
});
