let ioInstance = null;

function initSocket(io) {
  ioInstance = io;
  io.on("connection", (socket) => {
    console.log("[Socket.IO] Client terhubung");

    socket.on("disconnect", () => {
      console.log("[Socket.IO] Client terputus");
    });
  });
}

function emitLogUpdate(logEntry) {
  if (ioInstance) {
    ioInstance.emit("logUpdate", logEntry);
  }
}

function emitStatusUpdate(status) {
  if (ioInstance) {
    ioInstance.emit("statusUpdate", status);
  }
}

function emitQrUpdate(qrData) {
  if (ioInstance) {
    ioInstance.emit("qrUpdate", qrData);
  }
}

module.exports = {
  initSocket,
  emitLogUpdate,
  emitStatusUpdate,
  emitQrUpdate,
};
