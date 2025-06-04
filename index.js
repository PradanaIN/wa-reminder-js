const express = require("express");
const path = require("path");
const {
  startBot,
  getClient,
  isBotActive,
  stopBot,
} = require("./controllers/botController");
const {
  startScheduler,
  stopScheduler,
} = require("./controllers/schedulerController");
const { addLog } = require("./controllers/logController");

const botRoutes = require("./routes/botRoutes");
const messageRoutes = require("./routes/messageRoutes");
const systemRoutes = require("./routes/systemRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/bot", botRoutes);
app.use("/send", messageRoutes);
app.use("/", systemRoutes);

app.listen(PORT, () => {
  console.log(`[Server] Listening on port ${PORT}`);
  addLog(`[Server] Aplikasi berjalan di port ${PORT}`);
});

(async () => {
  await startBot();
  const client = getClient();

  if (client) {
    startScheduler(client, addLog, isBotActive);
  } else {
    addLog("[Init] Client belum siap, scheduler tidak dijalankan.");
  }

  process.on("SIGINT", async () => {
    console.log("\n[Exit] Menangkap SIGINT, menghentikan bot & scheduler...");
    stopScheduler(addLog);
    stopBot();
    process.exit(0);
  });
})();
