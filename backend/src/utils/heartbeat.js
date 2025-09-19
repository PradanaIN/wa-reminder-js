let lastHeartbeatTime = Date.now();
let intervalId = null;

function startHeartbeat(addLog, TIMEZONE, moment) {
  if (intervalId) return;

  intervalId = setInterval(() => {
    const now = Date.now();
    const diff = now - lastHeartbeatTime;
    const minutes = Math.floor(diff / 60000);

    const timestamp = moment().tz(TIMEZONE).format("YYYY-MM-DD HH:mm:ss");
    addLog(
      `[💓] Heartbeat aktif (${minutes} menit sejak terakhir) — ${timestamp}`
    );

    lastHeartbeatTime = now;
  }, 10 * 60 * 1000); // tiap 10 menit
}

function stopHeartbeat() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function resetHeartbeat() {
  lastHeartbeatTime = Date.now();
}

function getLastHeartbeat() {
  return lastHeartbeatTime;
}

module.exports = {
  startHeartbeat,
  stopHeartbeat,
  resetHeartbeat,
  getLastHeartbeat,
};
