process.on('uncaughtException', (err) => {
  console.error('[UncaughtException]', err.stack || err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('[UnhandledRejection]', reason?.stack || reason);
});

const http = require('http');
const { Server } = require('socket.io');

const config = require('./config/env');
const { createApp, attachSocket, buildAllowedOrigins } = require('./app');
const { initSocket } = require('./utils/socketHandler');
const { addLog } = require('./controllers/logController');
const { isBotActive, getClient } = require('./controllers/botController');
const { startScheduler, stopScheduler } = require('./controllers/schedulerController');
const { stopHeartbeat } = require('./utils/heartbeat');
const { cleanupWwebjsProfileLocks } = require('./utils/chromeProfile');

// Proactively clean Chromium profile locks on startup (safe if none exist)
try {
  const removed = cleanupWwebjsProfileLocks();
  if (removed) addLog('[Sistem] Membersihkan lock Chromium lama saat startup.');
} catch (_) {}

const app = createApp();
const server = http.createServer(app);

const allowedOrigins = Array.from(buildAllowedOrigins());
const corsConfig = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin tidak diizinkan oleh CORS'), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
};

const io = new Server(server, { cors: corsConfig });
initSocket(io);
attachSocket(app, io);

server.listen(config.port, () => {
  addLog(`[Sistem] Aplikasi berjalan di port ${config.port}`);
});

setTimeout(() => {
  if (!isBotActive()) {
    return;
  }

  const client = getClient();
  if (client) {
    addLog('[Scheduler] Menjalankan scheduler dinamis untuk bot aktif.');
    startScheduler(client, addLog);
  } else {
    addLog('[Scheduler] Bot aktif namun client belum siap. Scheduler menunggu.');
  }
}, 3000);

process.on('SIGINT', async () => {
  try {
    await addLog('[Sistem] Menerima sinyal SIGINT, mematikan server.');

    if (isBotActive()) {
      await addLog('[Sistem] Bot aktif, menghentikan bot dan scheduler...');
      const { stopBot } = require('./controllers/botController');
      await stopBot({ scheduler: false, heartbeat: false, bot: true });
      stopScheduler(addLog);
      stopHeartbeat();
      await addLog('[Sistem] Bot dan scheduler berhasil dihentikan.');
    }

    await addLog('[Sistem] Menonaktifkan server HTTP...');
    server.close(() => {
      addLog('[Sistem] Server HTTP ditutup.');
      process.exit(0);
    });
  } catch (err) {
    console.error('[SIGINT] Terjadi kesalahan saat shutdown:', err);
    process.exit(1);
  }
});
