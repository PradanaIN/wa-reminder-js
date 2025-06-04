let lastHeartbeatTime = Date.now();

function startHeartbeat(addLog, TIMEZONE, moment) {
  setInterval(() => {
    const now = Date.now();
    const sixHoursMs = 6 * 60 * 60 * 1000;

    if (now - lastHeartbeatTime >= sixHoursMs) {
      const timestamp = moment().tz(TIMEZONE).format("YYYY-MM-DD HH:mm:ss");
      addLog(`[💓] Bot aktif - ${timestamp}`);
      lastHeartbeatTime = now;
    }
  }, 60 * 60 * 1000); // tiap jam
}

function resetHeartbeat() {
  lastHeartbeatTime = Date.now();
}

module.exports = { startHeartbeat, resetHeartbeat };
