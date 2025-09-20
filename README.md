# WA Reminder Platform

Sistem pengingat WhatsApp yang kini dibagi menjadi dua aplikasi: **backend** untuk bot dan API, serta **frontend** untuk antarmuka admin/publik. Arsitektur baru ini memudahkan pengelolaan jadwal, meningkatkan reliabilitas, dan memberikan pengalaman pengguna yang lebih baik.

## Apa yang baru?

- ?? **Monorepo terstruktur** (`backend/` + `frontend/`).
- ?? **Konfigurasi jadwal dinamis** per hari dan override manual per tanggal.
- ?? **Penjadwalan ulang otomatis** ketika jadwal diubah atau override ditambahkan.
- ?? **Otorisasi berlapis**: halaman publik tanpa login, dashboard admin dengan sesi, API kontrol tetap memakai API key.
- ?? **Dashboard admin baru (React + Tailwind)** untuk mengatur jadwal, override, log, dan kontrol bot.
- ?? **Halaman status publik** yang menampilkan jadwal dan pengiriman berikutnya secara real-time.
- ????? **Reliabilitas bot ditingkatkan** dengan pemeriksaan koneksi periodik, watcher konfigurasi, dan restart otomatis.

## Arsitektur

```
wa-reminder/
+- backend/              # Layanan Express + WhatsApp bot
¦  +- src/
¦  ¦  +- app.js         # Inisialisasi Express & middleware
¦  ¦  +- server.js      # HTTP + Socket.IO bootstrap
¦  ¦  +- controllers/   # Logika bot, pesan, jadwal
- Kredensial Google Calendar (opsional bila menggunakan integrasi kalender libur).
- **Manajemen kontak pegawai**: Data kontak WhatsApp tersimpan permanen di `backend/storage/contacts.json` dan dapat diubah melalui API/halaman admin.
- **Manajemen kontak** (`/admin/contacts`): tambah, ubah, hapus kontak pegawai, serta ubah status kehadiran mereka.
¦  ¦  +- views/         # Halaman fallback server-side (EJS)
¦  +- public/           # Aset statis backend (legacy dashboard)
¦  +- storage/          # `schedule-config.json`, sesi WhatsApp
¦  +- logs/             # Log ter-rotate
¦
+- frontend/            # Aplikasi Vite + React (UI baru)
¦  +- src/
¦  ¦  +- pages/         # PublicStatus, AdminLogin, AdminDashboard
¦  ¦  +- queries/       # React Query hooks (auth, schedule, bot)
¦  ¦  +- components/    # UI kit & komponen utilitas
¦  ¦  +- lib/           # API client
¦  +- public/           # Aset build Vite
¦
+- package.json         # Workspaces + shared scripts
+- README.md
```

## Persyaratan

- Node.js 18 atau lebih baru.
- WhatsApp Web kompatibel (untuk `whatsapp-web.js`).
- Kredensial Google Sheet/Calendar (opsional bila menggunakan integrasi tersebut).

## Instalasi

```bash
# Clone repo
git clone https://github.com/pradanain/wa-reminder.git
cd wa-reminder

# Instal semua dependensi (backend + frontend)
npm install
```

### Konfigurasi backend (`backend/.env`)

```env
PORT=3001
WEB_APP_URL=http://localhost:3302
TIMEZONE=Asia/Makassar

ADMIN_USERNAME=admin
# Pilih salah satu dari dua opsi berikut:
ADMIN_PASSWORD=change_me            # untuk pengembangan lokal
# ADMIN_PASSWORD_HASH=               # hash bcrypt untuk produksi
SESSION_SECRET=please-change-this-secret

CONTROL_API_KEY=ubah_api_key

GOOGLE_REDIRECT_URI=urn:ietf:wg:oauth:2.0:oob
GOOGLE_TOKEN_PATH=./config/calendar_token.json
GOOGLE_CREDENTIALS_PATH=./config/calendar_oauth.json

SPREADSHEET_ID=isi_jika_menggunakan_google_sheet
SPREADSHEET_RANGE=Sheet1!A2:C

SCHEDULER_RETRY_INTERVAL_MS=60000
SCHEDULER_MAX_RETRIES=3
```

> Catatan: file kredensial sensitif di `backend/config/*.json` diabaikan oleh git. Simpan file asli pada direktori tersebut sebelum menjalankan aplikasi.

### Konfigurasi frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:3301
```

## Menjalankan

### Mode pengembangan (backend + frontend bersamaan)

```bash
npm run dev
```

- Backend tersedia di `http://localhost:3001`
- Frontend React tersedia di `http://localhost:5173`

### Menjalankan hanya backend

```bash
npm run dev:backend   # nodemon src/server.js
```

### Menjalankan hanya frontend

```bash
npm run dev:frontend  # vite dev server
```

### Build produksi

```bash
npm run build         # backend: no-op, frontend: vite build
```

Hasil build frontend berada di `frontend/dist/`. Sajikan folder ini melalui CDN atau reverse proxy lalu arahkan `WEB_APP_URL` ke domain produksimu.

## Fitur Backend

- **Penjadwalan dinamis**: `scheduleService` menyimpan jadwal ke `backend/storage/schedule-config.json`. File dibuat otomatis saat pertama kali dijalankan.
- **Override manual**: Override berlaku sekali dan otomatis ditandai setelah pengiriman, lalu dibersihkan.
- **Watcher file**: Perubahan manual pada `schedule-config.json` memicu reschedule otomatis.
- **Auto retry**: Jika WhatsApp client putus, sistem mencoba ulang sampai `SCHEDULER_MAX_RETRIES` dengan interval `SCHEDULER_RETRY_INTERVAL_MS`.
- **API baru**:
  - `GET /api/schedule` & `GET /api/schedule/next-run` (publik)
  - `POST /api/auth/login` & `POST /api/auth/logout`
  - `GET/PUT /api/admin/schedule`
  - `POST/DELETE /api/admin/schedule/overrides`
  - `POST /api/admin/bot/start` dan `POST /api/admin/bot/stop`
  - Endpoint lama `/api/system/*`, `/api/bot/*` tetap tersedia (dengan API key bila diperlukan).

## Fitur Frontend

- **Halaman publik** (`/`) menampilkan status bot, jadwal harian, dan pengiriman berikutnya.
- **Login admin** (`/admin/login`) dengan sesi cookie.
- **Dashboard admin** (`/admin/dashboard`):
  - Edit jadwal harian (time picker per hari).
  - Mengatur zona waktu dan pause scheduler.
  - Mengelola override manual (tambah/hapus).
  - Kontrol bot (start/stop) + indikator status.
  - Viewer log real-time (auto refresh).
- Dibangun dengan React + React Router + React Query + Tailwind v4.

## Catatan Operasional

- `backend/storage/schedule-config.json` dan `backend/storage/sessions/` diabaikan dari git namun disimpan lokal untuk menjalankan bot.
- Pastikan direktori `backend/logs/` writable, log akan dirotasi harian oleh Winston.
- Untuk produksi, gunakan reverse proxy (nginx/traefik) untuk mengamankan backend dan sajikan frontend hasil build.
- Backup file `schedule-config.json` bila ingin menjaga riwayat konfigurasi jadwal.

## Script bantu (root)

| Perintah                | Deskripsi                                      |
|------------------------|--------------------------------------------------|
| `npm run dev`          | Jalankan backend + frontend bersamaan            |
| `npm run dev:backend`  | Jalankan backend saja (nodemon)                  |
| `npm run dev:frontend` | Jalankan frontend (Vite)                         |
| `npm run build`        | Build frontend (backend tidak memerlukan build)  |
| `npm run lint`         | Lint backend (`eslint --ext .js src`)            |

---

Selamat menikmati arsitektur baru! Jika menemukan kendala atau ingin menambahkan fitur, lanjutkan dengan membuat branch baru dan pull request sesuai kebutuhan.
