let lastHeartbeatTime = Date.now();
let intervalId = null;

function startHeartbeat(addLog, TIMEZONE, moment) {
  // Cegah double start
  if (intervalId) return;

  intervalId = setInterval(() => {
    const now = Date.now();
    const halfHoursMs = 30 * 60 * 1000;

    if (now - lastHeartbeatTime >= halfHoursMs) {
      const timestamp = moment().tz(TIMEZONE).format("YYYY-MM-DD HH:mm:ss");
      addLog(`[💓] Bot aktif - ${timestamp}`);
      lastHeartbeatTime = now;
    }
  }, 60 * 60 * 1000); // tiap jam
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

module.exports = {
  startHeartbeat,
  stopHeartbeat,
  resetHeartbeat,
};
