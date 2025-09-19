let ioInstance = null;
let currentStatus = false;
let currentQR = null;

function initSocket(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("[Socket.IO] 🔌 Koneksi client:", socket.id);

    // Kirim status dan QR saat konek
    socket.emit("status-update", currentStatus);
    if (currentQR) {
      socket.emit("qr-update", currentQR);
    }

    socket.on("disconnect", () => {
      console.log("[Socket.IO] 🔌 Client disconnect:", socket.id);
    });
  });
}

function emitStatusUpdate(status) {
  currentStatus = status;
  if (ioInstance) {
    ioInstance.emit("status-update", status);
  }
}

function emitQrUpdate(qr) {
  currentQR = qr;
  if (ioInstance) {
    ioInstance.emit("qr-update", qr);
  }
}

function emitLogUpdate(logLine) {
  if (ioInstance) {
    ioInstance.emit("log-update", logLine);
  }
}

module.exports = {
  initSocket,
  emitStatusUpdate,
  emitQrUpdate,
  emitLogUpdate,
};
