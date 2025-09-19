export function updateStatus(data) {
  const statusEl = document.getElementById("status");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");

  if (!statusEl || !startBtn || !stopBtn) return;

  statusEl.textContent = data.active ? "🟢 AKTIF" : "🔴 NONAKTIF";
  startBtn.disabled = data.active;
  stopBtn.disabled = !data.active;
}

export async function fetchStatus(repeat = false) {
  try {
    const res = await fetch("/bot/status");
    const data = await res.json();
    updateStatus(data);

    if (repeat && !data.active) {
      setTimeout(() => fetchStatus(true), 1000); // coba lagi tiap 1 detik
    }
  } catch (e) {
    console.error("[Status] Error:", e);
  }
}
