const qrContainer = document.getElementById("qrContainer");
const qrCanvas = document.getElementById("qrCanvas");
const statusEl = document.getElementById("status");
const logEl = document.getElementById("log");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const toggleDarkModeBtn = document.getElementById("toggleDarkMode");
const darkModeIcon = document.getElementById("darkModeIcon");
const confirmModal = document.getElementById("confirmModal");
const confirmStopBtn = document.getElementById("confirmStop");
const cancelStopBtn = document.getElementById("cancelStop");

function setDarkMode(on) {
  document.body.classList.toggle("dark", on);
  toggleDarkMode.classList.toggle("dark", on);
  localStorage.setItem("darkMode", on);
}

toggleDarkMode.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  setDarkMode(!isDark);
});

// Inisialisasi sesuai preferensi sebelumnya
const preferredDark = localStorage.getItem("darkMode") === "true";
setDarkMode(preferredDark);
async function fetchQRCode() {
  try {
    const res = await fetch("/qr");
    const data = await res.json();
    if (data.qr) {
      qrContainer.classList.remove("hidden");
      QRCode.toCanvas(qrCanvas, data.qr, { width: 250 }, function (error) {
        if (error) console.error(error);
      });
    } else {
      qrContainer.classList.add("hidden");
    }
  } catch (e) {
    qrContainer.classList.add("hidden");
  }
}

async function fetchStatus() {
  const res = await fetch("/bot/status");
  const data = await res.json();
  statusEl.textContent = data.active ? "🟢 AKTIF" : "🔴 NONAKTIF";
  startBtn.disabled = data.active;
  stopBtn.disabled = !data.active;
}

async function fetchLogs() {
  const res = await fetch("/logs");
  const data = await res.json();
  logEl.textContent = data.logs.join("\n");
  logEl.scrollTop = logEl.scrollHeight;
}

startBtn.addEventListener("click", async () => {
  await fetch("/bot/start", { method: "POST" });
  await fetchStatus();
});

stopBtn.addEventListener("click", () => {
  confirmModal.classList.remove("hidden");
});

cancelStopBtn.addEventListener("click", () => {
  confirmModal.classList.add("hidden");
});

confirmStopBtn.addEventListener("click", async () => {
  confirmModal.classList.add("hidden");
  await fetch("/bot/stop", { method: "POST" });
  await fetchStatus();
});

setInterval(() => {
  fetchStatus();
  fetchLogs();
  fetchQRCode();
}, 3000);

fetchStatus();
fetchLogs();
fetchQRCode();
