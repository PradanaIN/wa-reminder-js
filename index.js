const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const { isBotActive } = require("./controllers/botController");
const { stopScheduler } = require("./controllers/schedulerController");
const { stopHeartbeat } = require("./utils/heartbeat");
const { addLog } = require("./controllers/logController");
const { initSocket } = require("./utils/socketHandler");
// Inisialisasi dotenv untuk mengakses variabel lingkungan
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
// Cek apakah PORT sudah di-set

// Create HTTP server (penting untuk Socket.IO)
const server = http.createServer(app);

// Create Socket.IO instance
const io = new Server(server, {
  cors: {
    origin: "*", // Sesuaikan jika nanti pakai domain
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

// Initialize Socket.IO
initSocket(io);

// Simpan instance io agar bisa dipakai di controller
app.set("io", io);

// Setup EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
const botRoutes = require("./routes/botRoutes");
const messageRoutes = require("./routes/messageRoutes");
const systemRoutes = require("./routes/systemRoutes");
const { add } = require("winston");

app.use("/bot", botRoutes);
app.use("/send", messageRoutes);
app.use("/", systemRoutes);

// Start server via HTTP server (bukan app.listen)
server.listen(PORT, () => {
  addLog(`[Sistem] Aplikasi berjalan di port ${PORT}`);
});

// Handle error: uncaught exception
process.on("uncaughtException", (err) => {
  addLog(`[Error] Uncaught Exception: ${err.message}`);
});

// Handle error: unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
  addLog(`[Error] Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

// Graceful shutdown saat Ctrl+C ditekan
process.on("SIGINT", async () => {
  addLog("[Sistem] Menerima sinyal SIGINT, mematikan server...");

  // Jika stopScheduler async, tunggu selesai
  if (stopScheduler.constructor.name === "AsyncFunction") {
    await stopScheduler(addLog);
  } else {
    stopScheduler(addLog);
  }

  addLog("[Sistem] 💓 Menghentikan heartbeat...");
  stopHeartbeat();
  addLog("[Sistem] 💓 Heartbeat berhasil dihentikan.");

  addLog("[Sistem] 🤖 Memeriksa status bot...");
  if (isBotActive()) {
    addLog("[Sistem] 🤖 Bot aktif, menghentikan bot...");
    const botController = require("./controllers/botController");
    await botController.stopBot();
    addLog("[Sistem] 🤖 Bot berhasil dihentikan.");
  } else {
    addLog("[Sistem] 🤖 Bot tidak aktif.");
  }

  addLog("[Sistem] 🛑 Server tidak aktif.");

  // Delay sedikit sebelum exit supaya log sempat terkirim ke socket
  setTimeout(() => process.exit(0), 500);
});
