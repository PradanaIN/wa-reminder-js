# WhatsApp Reminder Bot (SIGAP)

## Deskripsi Aplikasi

WhatsApp Reminder Bot (SIGAP) adalah aplikasi bot WhatsApp yang berfungsi untuk mengirimkan pesan pengingat otomatis kepada karyawan atau tim sesuai jadwal kerja harian. Bot ini dirancang untuk membantu mengingatkan aktivitas penting seperti absen pulang, pemeriksaan perangkat, dan pengisian laporan harian melalui WhatsApp secara otomatis.

## Tujuan Aplikasi

- Meningkatkan kedisiplinan dan produktivitas dengan pengingat otomatis.
- Memudahkan pengawasan aktivitas harian tanpa perlu pengingat manual.
- Mengurangi kesalahan atau kelupaan terkait aktivitas rutin harian.

## Fitur Utama

- 🔁 Pengiriman pesan otomatis berdasarkan hari kerja dan jadwal waktu yang ditentukan.
- 📅 Scheduler pintar yang menyesuaikan hari kerja (Senin–Jumat), skip weekend.
- 📋 Pengambilan daftar kontak dinamis dari Google Sheets.
- 🖥️ Dashboard web dengan antarmuka modern dan dark/light mode.
- ▶️ Tombol start/stop bot langsung dari dashboard.
- 🔌 API endpoint untuk trigger manual pengiriman pesan dan keepalive ping.
- 🔐 Autentikasi sesi WhatsApp menggunakan LocalAuth, menghindari scan QR berulang.
- 📡 Monitoring koneksi, status bot, dan log aktivitas secara realtime via WebSocket.
- 🔍 Filter log realtime di dashboard untuk pencarian mudah.
- 📈 Chart interaktif menampilkan statistik pengiriman pesan dan error.
- 💡 Auto-detect mode gelap dari preferensi sistem dan toggle manual.
- ⚠️ Proteksi kredensial dan secret scanning agar aman dari kebocoran di Git.

## Teknologi yang Digunakan

- **Node.js** — Runtime backend utama.
- **whatsapp-web.js** — Integrasi tidak resmi dengan WhatsApp Web.
- **Express.js** — Server API dan dashboard.
- **Google Sheets API** — Mengambil daftar kontak secara dinamis.
- **Moment-timezone** — Penanganan zona waktu lokal.
- **Socket.IO** — Komunikasi realtime dashboard.
- **winston + DailyRotateFile** — Logging dengan rotasi harian.
- **Tailwind CSS + shadcn/ui** — UI dashboard modern dan responsif.
- **dotenv** — Konfigurasi environment variables.

## Persiapan Environment

1. Pastikan Node.js (v16 ke atas) sudah terinstall di komputer/server kamu.
2. Clone repository ini:

   ```bash
   git clone https://github.com/pradanain/wa-reminder.git
   cd wa-reminder
   ```

3. Install dependencies

   ```
   npm install

   ```

4. Buat file `.env` untuk konfigurasi variabel environment

   ```
   PORT=PORT_KAMU
   TIMEZONE=TIMEZONE_KAMU
   GOOGLE_CREDENTIALS_PATH=PATH_CREDNTIALS_KAMU
   SPREADSHEET_ID=ID_GOOGLE_SHEET_KAMU
   CONTROL_API_KEY=API_KEY_KONTROL_KAMU

   ```

   Gunakan nilai `CONTROL_API_KEY` untuk mengamankan endpoint kontrol bot dan editor template. Kunci ini wajib dikirimkan oleh klien ketika mengakses API terkait.

## Menjalankan Aplikasi

Jalankan perintah berikut untuk memulai bot dan server:

```
node index.js
```

- Setelah berjalan, scan QR code yang muncul di terminal menggunakan WhatsApp di ponsel kamu.
- Buka browser dan akses `http://localhost:port` untuk membuka dashboard.
- Dashboard menampilkan log realtime, tombol start/stop bot, status koneksi, dan chart statistik.
- Gunakan fitur filter log dan toggle dark mode di dashboard.

## Autentikasi API Kontrol

- Semua request ke endpoint `/bot` dan `/template` kini memerlukan API key.
- Sertakan header `x-api-key: <CONTROL_API_KEY>` pada setiap request. Alternatifnya, gunakan header `Authorization: Bearer <CONTROL_API_KEY>`.
- Jika header tidak dikirim, server akan mengembalikan status **401 Unauthorized**.
- Jika kunci salah, server akan mengembalikan status **403 Forbidden**.
- Pastikan variabel environment `CONTROL_API_KEY` terkonfigurasi di server atau file `.env` sebelum menjalankan aplikasi.

## Struktur Folder

```
wa-reminder/
├── config/		# Service dan OAuth
├── controllers/        # Pengontrol pengiriman pesan
├── jobs/               # Scheduler harian (dailyJob.js)
├── log/           	# Dokumentasi log
├── public/             # Dashboard frontend
├── routes/		# Endpoint
├── services/           # Sesi OAuth
├── sessions/           # Sesi login WhatsApp
├── templates/          # Template pesan
├── utils/              # Lain-lain
├── views/           	# EJS Template Engine
├── .env                # Konfigurasi environment
├── index.js            # Entry point utama
└── README.md

```

## NOTE

- Aplikasi ini menggunakan `whatsapp-web.js` yang merupakan library tidak resmi, jadi ada kemungkinan ada batasan atau perubahan dari pihak WhatsApp yang mempengaruhi bot.
- Pastikan koneksi internet stabil agar bot bisa berjalan lancar.
- jangan sebarkan `credentials` dan file `.env` ke publik.
- Gunakan dengan bijak dan pastikan sesuai dengan kebijakan WhatsApp.
