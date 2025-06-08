export function initSocket(onStatusUpdate, onLogUpdate, onQrUpdate) {
  const socket = io();

  socket.on("statusUpdate", onStatusUpdate);
  socket.on("logUpdate", onLogUpdate);
  socket.on("qrUpdate", onQrUpdate);

  socket.on("connect", () => console.log("[Socket.IO] Connected"));
  socket.on("disconnect", () => console.log("[Socket.IO] Disconnected"));

  return socket;
}
