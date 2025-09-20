const actions = document.querySelectorAll('[data-action]');
const statusEl = document.querySelector('.status');
const logViewer = document.querySelector('.log-viewer');

async function fetchJson(url, options) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Permintaan gagal');
  }
  return response.json();
}

function updateStatus(active) {
  if (!statusEl) return;
  statusEl.classList.toggle('active', active);
  statusEl.classList.toggle('inactive', !active);
  statusEl.textContent = active ? 'Aktif' : 'Tidak Aktif';
}

actions.forEach((button) => {
  button.addEventListener('click', async () => {
    const action = button.dataset.action;
    button.disabled = true;
    button.classList.add('is-loading');

    try {
      const result = await fetchJson(/api/admin/bot/, { method: 'POST' });
      updateStatus(Boolean(result.active));
    } catch (err) {
      console.error(err);
      if (window.Swal) {
        window.Swal.fire({
          icon: 'error',
          title: 'Terjadi kesalahan',
          text: err?.message || 'Permintaan gagal',
        });
      } else {
        alert('Terjadi kesalahan: ' + err.message);
      }
    } finally {
      button.disabled = false;
      button.classList.remove('is-loading');
    }
  });
});

async function refreshLogs() {
  if (!logViewer) return;
  try {
    const result = await fetchJson('/api/system/logs?limit=50');
    logViewer.textContent = result.logs.join('\n');
  } catch (err) {
    console.warn('Gagal memuat log:', err.message);
  }
}

setInterval(refreshLogs, 60_000);
