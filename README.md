# WhatsApp Reminder Bot (SIGAP)

## Deskripsi Aplikasi

WhatsApp Reminder Bot (SIGAP) adalah aplikasi bot WhatsApp yang berfungsi untuk mengirimkan pesan pengingat otomatis kepada karyawan atau tim sesuai jadwal kerja harian. Bot ini dirancang untuk membantu mengingatkan aktivitas penting seperti absen pulang, pemeriksaan perangkat, dan pengisian laporan harian melalui WhatsApp secara otomatis.

## Tujuan Aplikasi

- Meningkatkan kedisiplinan dan produktivitas dengan pengingat otomatis.
- Memudahkan pengawasan aktivitas harian tanpa perlu pengingat manual.
- Mengurangi kesalahan atau kelupaan terkait aktivitas rutin harian.

## Fitur Utama

- 🔁 Pengiriman pesan otomatis berdasarkan hari kerja dan waktu yang ditentukan.
- 📅 Scheduler pintar yang menyesuaikan hari kerja (Senin–Jumat).
- 📋 Pengambilan daftar kontak dari Google Sheets.
- 🖥️ Dashboard web sederhana dengan tampilan dark/light mode.
- ▶️ Tombol start/stop bot dari dashboard.
- 🔌 Endpoint API untuk pengiriman manual dan `keepalive` ping.
- 🔐 Autentikasi sesi WhatsApp berbasis `LocalAuth`.
- 📡 Monitoring koneksi dan log aktivitas bot secara real-time.
- ⚠️ Deteksi kredensial dan perlindungan dari penyebaran di Git.

## Cara Membuat Aplikasi Ini

Aplikasi ini dibuat menggunakan:

- Node.js sebagai runtime server.
- `whatsapp-web.js` untuk integrasi WhatsApp Web API tidak resmi.
- Express.js untuk membuat server API dan dashboard web.
- Moment-timezone untuk penanganan waktu dan timezone.
- UI dashboard menggunakan framework UI modern (contoh: shadcn/ui).
- Penyimpanan sesi WhatsApp menggunakan `LocalAuth` agar sesi tersimpan secara lokal dan tidak perlu scan QR code berulang kali.

## Teknologi yang Digunakan

- **Node.js** — Runtime backend utama.
- **whatsapp-web.js** — Integrasi tidak resmi dengan WhatsApp Web.
- **Express.js** — Server API dan dashboard.
- **Google Sheets API** — Mengambil daftar kontak secara dinamis.
- **Moment-timezone** — Penanganan zona waktu lokal.
- **shadcn/ui + Tailwind CSS** — Tampilan antarmuka modern (dashboard).
- **dotenv** — Konfigurasi environment variables.
- **GitHub Secret Scanning Protection** — Untuk keamanan repositori.

## Persiapan Environment

1.
2. Pastikan Node.js (v16 ke atas) sudah terinstall di komputer/server kamu.
3. Clone repository ini:

   ```bash
   git clone https://github.com/pradanain/wa-reminder.git
   cd wa-reminder
   ```

4. Install dependencies

   ```
   npm install

   ```

5. Buat file `.env` (jika perlu) untuk konfigurasi variabel environment

   ```
   PORT=3000
   TIMEZONE=Asia/Jakarta
   GOOGLE_CREDENTIALS_PATH=./credentials.json
   SPREADSHEET_ID=your_google_sheet_id

   ```

   file `credentials.json` dari Google Cloud Console

## Menjalankan Aplikasi

Jalankan perintah berikut untuk memulai bot dan server:

```
node index.js
```

- Setelah berjalan, scan QR code yang muncul di terminal menggunakan WhatsApp di ponsel kamu.
- Buka browser dan akses `http://localhost:3000` untuk membuka dashboard.
- Dashboard menampilkan log aktivitas dan tombol untuk start/stop bot.

## Struktur Folder

```
wa-reminder/
├── controllers/        # Pengontrol pengiriman pesan
├── jobs/               # Scheduler harian (dailyJob.js)
├── public/             # Dashboard frontend
├── sessions/           # Sesi login WhatsApp
├── templates/          # Template pesan
├── utils/              # Kalender, kontak, kutipan, heartbeat, dsb
├── routes/		# Endpoint
├── .env                # Konfigurasi environment (tidak di-commit)
├── credentials.json    # Google API credential (jangan di-commit)
├── index.js            # Entry point utama
└── README.md

```

## NOTE

- Aplikasi ini menggunakan `whatsapp-web.js` yang merupakan library tidak resmi, jadi ada kemungkinan ada batasan atau perubahan dari pihak WhatsApp yang mempengaruhi bot.
- Pastikan koneksi internet stabil agar bot bisa berjalan lancar.
- Gunakan dengan bijak dan pastikan sesuai dengan kebijakan WhatsApp.
