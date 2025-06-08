const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

export function updateStatus(data) {
  if (!statusEl || !startBtn || !stopBtn) return;

  statusEl.textContent = data.active ? "🟢 AKTIF" : "🔴 NONAKTIF";
  startBtn.disabled = data.active;
  stopBtn.disabled = !data.active;
}

export async function fetchStatus() {
  try {
    const res = await fetch("/bot/status");
    const data = await res.json();
    updateStatus(data);
  } catch (e) {
    console.error("[Status] Error:", e);
  }
}
