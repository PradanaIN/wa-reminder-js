import { updateStatus } from "./statusHandler.js";
import { appendLog } from "./logHandler.js";
import { renderQR } from "./qrHandler.js";

export function initSocket() {
  const socket = io();

  socket.on("status-update", (status) => {
    console.log("[Socket] 🔄 Status update:", status);
    updateStatus({ active: status });
  });

  socket.on("log-update", (line) => {
    console.log("[Socket] 📝 Log baru:", line);
    appendLog(line);
  });

  socket.on("qr-update", (qrData) => {
    console.log("[Socket] 📱 QR update");
    renderQR(qrData);
  });
}
