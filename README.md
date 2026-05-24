# ⚡ NoteZ

> Aplikasi produktivitas pribadi all-in-one dengan desain Neo Brutalism modern.

NoteZ adalah aplikasi catatan harian yang menggabungkan **To Do List**, **Catatan Keuangan**, dan **Wishlist Tracker** dalam satu platform dengan tampilan Neo Brutalism yang playful namun tetap profesional. Data tersimpan langsung di perangkat (*offline-first*) tanpa perlu login, dengan opsi backup ke cloud.

---

## Fitur Utama

### ✅ To Do List
- Tambah, edit, dan hapus tugas
- Prioritas tugas (Tinggi, Sedang, Rendah)
- Kategori tugas (Kuliah, Kerja, Pribadi, dll)
- Deadline dengan date picker
- Filter tugas (Semua, Aktif, Selesai)
- Progress bar harian

### 💰 Catatan Keuangan
- Input pemasukan dan pengeluaran
- Kategori transaksi dengan ikon
- Saldo otomatis terhitung real-time
- Format mata uang Rupiah (IDR)
- Riwayat transaksi lengkap

### 🛍️ Wishlist Tracker
- Tambah barang impian dengan target harga
- Progress tabungan menuju wishlist
- Link marketplace (Tokopedia, Shopee, dll)
- Prioritas wishlist dengan sistem bintang
- Status tercapai

### 📊 Dashboard
- Ringkasan tugas hari ini
- Total saldo terkini
- Jumlah wishlist aktif
- Statistik produktivitas

---

## Teknologi

| Layer | Teknologi |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Icons | Tabler Icons |
| Storage | localStorage (offline-first) |
| State | React Hooks |
| Mobile | Capacitor (Android APK) |
| Database | Supabase (opsional, untuk backup cloud) |
| Font | Space Grotesk |

---

## Desain

NoteZ menggunakan konsep **Neo Brutalism** — gaya desain yang menggabungkan:
- Border hitam tebal
- Shadow offset khas brutalism
- Warna cerah dan kontras
- Tipografi bold dan tegas
- Komponen kotak tanpa blur berlebihan

**Palet Warna:**

| Warna | Hex | Digunakan untuk |
|---|---|---|
| Kuning | `#FFE135` | Aksen utama, CTA |
| Biru Elektrik | `#3B6FFF` | To Do List |
| Pink | `#FF4DA6` | Wishlist |
| Hijau Neon | `#00E676` | Keuangan, sukses |
| Orange | `#FF6B2B` | Peringatan |
| Hitam | `#0A0A0A` | Border, teks |

---

## Cara Menjalankan

### Prerequisites
- Node.js v18+
- npm

### Instalasi

```bash
# Clone repository
git clone https://github.com/Moreyartea/notez.git

# Masuk ke folder project
cd notez

# Install dependencies
npm install
```

### Setup Environment (Opsional — untuk fitur backup cloud)

```bash
# Salin file contoh environment
cp .env.example .env.local
```

Isi `.env.local` dengan kredensial Supabase kamu:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## Build Android APK

### Prerequisites
- Android Studio
- Java JDK 17+

### Langkah-langkah

```bash
# Build Next.js menjadi file statis
npm run build

# Sync ke project Android
npx cap sync android

# Buka di Android Studio
npx cap open android
```

Di Android Studio:
1. Tekan **Shift + Shift**
2. Ketik **"Generate APKs"**
3. Tekan **Enter**
4. Tunggu proses build selesai
5. File APK tersedia di:
android/app/build/outputs/apk/debug/app-debug.apk

---

## Struktur Folder
notez/
├── app/
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── todos/
│   │   ├── finance/
│   │   └── wishlist/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── storage.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── ui/
│       ├── NbButton.tsx
│       ├── NbCard.tsx
│       └── NbInput.tsx
├── android/
├── public/
├── .env.example
├── .env.local
├── capacitor.config.ts
└── README.md

---

## Roadmap

- [x] To Do List dengan prioritas dan kategori
- [x] Catatan Keuangan dengan format Rupiah
- [x] Wishlist Tracker dengan progress tabungan
- [x] Dashboard ringkasan
- [x] Offline-first dengan localStorage
- [x] Android APK via Capacitor
- [ ] Bottom Navigation Bar
- [ ] Dark Mode
- [ ] Backup & Sync ke Supabase
- [ ] Grafik Keuangan Bulanan
- [ ] Export PDF / CSV
- [ ] Push Notification untuk deadline
- [ ] Statistik Produktivitas

---

## Lisensi

MIT License — Copyright © 2026 Moreyartea

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

---

## Kontak

**Moreyartea**  
GitHub: [@Moreyartea](https://github.com/Moreyartea)

---

<div align="center">
  <sub>Dibuat dengan hati menggunakan Next.js + Tailwind CSS</sub>
</div>