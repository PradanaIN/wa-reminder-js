<<<<<<< HEAD

# wa-reminder-js

# WhatsApp Bot Reminder M\enggunakan whatsapp-web.js

# WhatsApp Reminder Bot (SIGAP)

## Deskripsi Aplikasi

WhatsApp Reminder Bot (SIGAP) adalah aplikasi bot WhatsApp yang berfungsi untuk mengirimkan pesan pengingat otomatis kepada karyawan atau tim sesuai jadwal kerja harian. Bot ini dirancang untuk membantu mengingatkan aktivitas penting seperti absen pulang, pemeriksaan perangkat, dan pengisian laporan harian melalui WhatsApp secara otomatis.

## Tujuan Aplikasi

- Meningkatkan kedisiplinan dan produktivitas dengan pengingat otomatis.
- Memudahkan pengawasan aktivitas harian tanpa perlu pengingat manual.
- Mengurangi kesalahan atau kelupaan terkait aktivitas rutin harian.

## Fitur Utama

- Pengiriman pesan otomatis sesuai jadwal (berdasarkan hari kerja dan waktu tertentu).
- Sistem scheduler yang menyesuaikan hari kerja dan jam pengiriman.
- Dashboard web minimalis untuk menampilkan log aktivitas bot.
- Tombol start dan stop bot dari dashboard.
- Mode tampilan tema gelap (dark mode) dan terang.
- Endpoint API untuk mengirim pesan manual.
- Endpoint keepalive untuk menjaga bot tetap aktif (terintegrasi dengan cron job atau GitHub Actions).
- Sistem autentikasi sesi WhatsApp menggunakan `whatsapp-web.js` dan `LocalAuth`.
- Monitoring status koneksi WhatsApp.
- Log aktivitas bot yang mudah dipantau.

## Cara Membuat Aplikasi Ini

Aplikasi ini dibuat menggunakan:

- Node.js sebagai runtime server.
- `whatsapp-web.js` untuk integrasi WhatsApp Web API tidak resmi.
- Express.js untuk membuat server API dan dashboard web.
- Moment-timezone untuk penanganan waktu dan timezone.
- UI dashboard menggunakan framework UI modern (contoh: shadcn/ui).
- Penyimpanan sesi WhatsApp menggunakan `LocalAuth` agar sesi tersimpan secara lokal dan tidak perlu scan QR code berulang kali.

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

4. Buat file `.env` (jika perlu) untuk konfigurasi variabel environment (sesuaikan dengan kebutuhan, contoh variabel: PORT, TIMEZONE, dll).

## Menjalankan Aplikasi

Jalankan perintah berikut untuk memulai bot dan server:

```
node index.js
```

- Setelah berjalan, scan QR code yang muncul di terminal menggunakan WhatsApp di ponsel kamu.
- Buka browser dan akses `http://localhost:3000` untuk membuka dashboard.
- Dashboard menampilkan log aktivitas dan tombol untuk start/stop bot.

## Cara Deploy

- Aplikasi ini bisa dideploy ke layanan hosting Node.js seperti Render.com, Heroku, atau VPS lain.
- Pastikan bot tetap aktif dengan setup cron job atau GitHub Actions yang melakukan ping ke endpoint `/keepalive` setiap 10 menit.

## Struktur Folder

```
wa-reminder/
├── controllers/       # Logic pengiriman pesan dan scheduler
├── jobs/              # Job yang dijalankan secara berkala (dailyJob.js)
├── sessions/          # Penyimpanan sesi WhatsApp
├── templates/         # Template pesan WhatsApp
├── public/             # File frontend
├── index.js           # Entry point aplikasi
├── package.json       # Dependencies & scripts
└── README.md          # Dokumentasi proyek

```

## NOTE

- Aplikasi ini menggunakan `whatsapp-web.js` yang merupakan library tidak resmi, jadi ada kemungkinan ada batasan atau perubahan dari pihak WhatsApp yang mempengaruhi bot.
- Pastikan koneksi internet stabil agar bot bisa berjalan lancar.
- Gunakan dengan bijak dan pastikan sesuai dengan kebijakan WhatsApp.

> > > > > > > 1a724dc (first deployment)
