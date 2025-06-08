let qrContainer = null;
let qrCanvas = null;

function renderQR(data) {
  if (!qrContainer || !qrCanvas) {
    console.warn("Elemen QR tidak ditemukan di DOM");
    return;
  }
  qrContainer.classList.remove("hidden");

  QRCode.toCanvas(qrCanvas, data, { width: 256 }, (error) => {
    if (error) console.error("Error render QR:", error);
    else console.log("QR code berhasil dirender!");
  });
}

export async function fetchQRCode() {
  // Delay cek elemen sampai DOM siap
  if (!qrContainer || !qrCanvas) {
    qrContainer = document.getElementById("qrContainer");
    qrCanvas = document.getElementById("qrCanvas");
  }

  if (!qrContainer || !qrCanvas) {
    console.warn("Elemen QR tidak ditemukan di DOM.");
    return;
  }

  try {
    const res = await fetch("/qr");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    if (data.qr) {
      qrContainer.classList.remove("hidden");
      renderQR(data.qr);
    } else {
      qrContainer.classList.add("hidden");
    }
  } catch (e) {
    console.error("[QR] Gagal fetch QR:", e);
    qrContainer.classList.add("hidden");
  }
}

// Optional helper untuk init dari luar
export function initQRHandler() {
  document.addEventListener("DOMContentLoaded", () => {
    qrContainer = document.getElementById("qrContainer");
    qrCanvas = document.getElementById("qrCanvas");
    fetchQRCode();
  });
}
