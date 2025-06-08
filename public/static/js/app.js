import { initDarkMode } from "./modeHandler.js";
import { initBotControl } from "./botHandler.js";
import { fetchStatus } from "./statusHandler.js";
import { initSocket } from "./socketHandler.js";
import { fetchLogs, appendLog, enableLogFiltering } from "./logHandler.js";
import { initQRHandler } from "./qrHandler.js";
import { renderCharts } from "./chartHandler.js";
import { initTabs } from "./tabHandler.js";
import { showLoader } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Dark mode setup
  initDarkMode(renderCharts);
  document.body.style.visibility = "visible";

  // 2. Socket.IO listeners
  initSocket(
    (status) => {
      console.log("[Socket.IO] Status update:", status);
      fetchStatus();
    },
    (logEntry) => {
      console.log("[Socket.IO] Log update:", logEntry);
      appendLog(logEntry);
    },
    (qrData) => {
      console.log("[Socket.IO] QR update:", qrData);
      initQRHandler(qrData); // render QR code dari socket
    }
  );

  // 3. Bot control buttons (start/stop)
  initBotControl(fetchStatus);

  // 4. Fetch initial status, logs, QR
  fetchStatus();
  fetchLogs();
  enableLogFiltering();

  // 5. Render grafik awal
  renderCharts();

  // 6. Tab navigation
  initTabs();

  // 7. Hide loader awal
  showLoader(false);
});
