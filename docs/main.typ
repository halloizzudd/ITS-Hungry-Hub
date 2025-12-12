#set document(
  title: "Laporan Final Project: ITS Hungry Hub",
  author: "Izzudin Ali Akbari",
)

#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2.5cm),
  numbering: "1",
)

#set text(
  font: "New Computer Modern",
  size: 11pt,
)

#set par(
  justify: true,
  leading: 0.65em,
)

#show heading: set block(above: 1.4em, below: 1em)

// --- TITLE PAGE ---
#align(center)[
  #v(2cm)
  #text(size: 18pt, weight: "bold")[Laporan Final Project: ITS Hungry Hub] 
  
  #v(0.5cm)
  #text(size: 14pt)[Pemrograman Framework - 2025/2026]
  
  #v(0.5cm)
  #text(size: 12pt)[Departemen Informatika - Institut Teknologi Sepuluh Nopember]

  #v(4cm)
  
  *Disusun Oleh:* \
  #v(0.5cm)
  *Izzudin Ali Akbari* \
  *NRP: 5025231313*

]

#pagebreak()

// --- CONTENT ---

= 1. Identitas Proyek

- *Nama Proyek*: ITS Hungry Hub
- *Nama Mahasiswa*: Izzudin Ali Akbari
- *NRP*: 5025231313
- *Kategori*: Custom Project (Tingkat Lanjut/Advanced)
  - _Referensi_: Bagian 4.3 (Food Delivery Platform / Ide Sendiri)
  - _Justifikasi_: Proyek ini mengimplementasikan ekosistem pesan-antar makanan khusus kampus, yang melibatkan aktor multi-peran (Penjual/Kantin dan Konsumen), status pesanan yang kompleks (Menunggu, Diproses, Siap, Selesai), dan manajemen inventaris waktu nyata (real-time).

= 2. Deskripsi Proyek

*ITS Hungry Hub* adalah platform pesan-antar makanan dan pre-order berbasis web yang dirancang khusus untuk lingkungan kampus ITS. Aplikasi ini menjembatani kesenjangan antara kantin kampus (penjual) dan mahasiswa/staf (konsumen).

Berbeda dengan situs E-commerce standar, ITS Hungry Hub berfokus pada:
+ *Pesanan Kritis Waktu (Time-Critical)*: Optimasi untuk "Pickup" atau "Campus Delivery" dalam waktu istirahat perkuliahan yang singkat.
+ *Verifikasi Kantin*: Memastikan semua penjual adalah anggota komunitas kampus yang valid.
+ *Menu Dinamis*: Penjual dapat dengan mudah mengubah ketersediaan kantin (`isOpen`) dan stok secara real-time.

= 3. Tech Stack (Teknologi yang Digunakan)

Proyek ini mendemonstrasikan penguasaan pemrograman framework modern sesuai ketentuan:

== Frontend
- *Framework*: *Next.js 14+* (App Router)
  - Menggunakan Server Components untuk performa.
  - Client Components untuk UI interaktif (keranjang belanja, form).
- *Styling*: Tailwind CSS (CSS modern berbasis utilitas).
- *Manajemen State*: Zustand (untuk efisiensi state Auth & Keranjang).

== Backend
- *Framework*: *NestJS* (Arsitektur modular dan terstruktur).
- *Bahasa*: TypeScript.
- *Database ORM*: *Prisma* (Akses database yang aman/Type-safe).
- *Database Engine*: SQLite (Development) / PostgreSQL (Siap Produksi).

== Library Utama Core
- *Autentikasi*: `@nestjs/jwt`, `passport-jwt`, `bcrypt` (Autentikasi Aman).
- *Validasi*: `class-validator`, `class-transformer` (Validasi DTO).
- *Upload File*: `multer` (Penanganan penyimpanan lokal).
- *Email*: `nodemailer` (Sistem notifikasi).

= 4. User Stories & Fitur

Proyek ini mengimplementasikan *7 User Stories Inti*, melebihi persyaratan minimum (6).

== 🔐 Autentikasi & Otorisasi (RBAC)
+ *Sebagai Pengguna (Penjual/Pembeli)*, saya dapat mendaftar dan login dengan aman.
  - _Implementasi_: JWT Tokens (Access + Refresh), Hashing Password (Bcrypt).
  - _Dekorator_: `@Public()`, `@Roles('SELLER')`, `@UseGuards(JwtAuthGuard)`.

== 🏪 Ekosistem Penjual (Kantin)
+ *Sebagai Penjual*, saya dapat mengelola Profil Kantin saya.
  - _Implementasi_: Membuat profil, upload KTP untuk verifikasi, mengatur status buka/tutup.
+ *Sebagai Penjual*, saya dapat mengelola Menu (CRUD Produk).
  - _Implementasi_: Tambah produk dengan foto (upload), atur stok, harga, dan waktu persiapan.
+ *Sebagai Penjual*, saya dapat memproses Pesanan masuk.
  - _Implementasi_: Melihat dashboard pesanan, update status (`Pending` -> `Processing` -> `Ready`).

== 👤 Pengalaman Konsumen (Mahasiswa)
+ *Sebagai Konsumen*, saya dapat menelusuri dan mencari makanan.
  - _Implementasi_: Filter berdasarkan kategori, cari berdasarkan nama, lihat ketersediaan kantin.
+ *Sebagai Konsumen*, saya dapat melakukan Pemesanan (Order).
  - _Implementasi_: Masukkan ke keranjang, checkout, upload bukti bayar (jika manual) atau transaksi sistem.
+ *Sebagai Pengguna*, saya dapat melihat Riwayat Pesanan.
  - _Implementasi_: Melihat pesanan masa lalu dan update status terkini.

= 5. Arsitektur Sistem & Database

== Skema Database (Prisma)
Database dirancang untuk menangani integritas data relasional antara Users (Pengguna), SellerProfiles (Profil Penjual), dan Orders (Pesanan).

#block(
  fill: luma(240),
  inset: 10pt,
  radius: 4pt,
  [
    *Relasi Inti:*
    - `User` 1 -- 0..1 `SellerProfile`
    - `User` 1 -- ** `Order`
    - `SellerProfile` 1 -- ** `Product`
    - `SellerProfile` 1 -- ** `Order`
    - `Order` 1 -- * `OrderItem` * -- 1 `Product`
  ]
)

= 6. Strategi Testing

Proyek ini mematuhi persyaratan pengujian yang ketat untuk memastikan keandalan sistem.

== Backend Testing (NestJS)
- *Unit Testing*: Pengujian terisolasi untuk Services dan Controllers.
- *E2E Testing*: Pengujian antarmuka alur penuh menggunakan `supertest`.
  - _Konfigurasi_: `test/jest-e2e.json`.
  - _Target Coverage_: >70% Statements/Branches.

== Skenario Pengujian yang Diimplementasikan
+ *Alur Autentikasi*: Register -> Login -> Dapatkan Token.
+ *Alur Produk*: Buat Produk (Otorisasi Sukses) -> Gagal Buat (Tanpa Izin).
+ *Alur Pesanan*: Buat Pesanan -> Verifikasi Pengurangan Stok.

= 7. Highlight Implementasi

*Contoh: Protected Route (Rute Terlindungi) di NestJS*

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SELLER')
@Post('products')
create(@Body() createProductDto: CreateProductDto) {
  return this.productsService.create(createProductDto);
}```

= 8. Development & Deployment

== Menjalankan Secara Lokal

*Backend*
```bash
cd backend
pnpm install
npx prisma migrate dev
pnpm start:dev
```

*Frontend*
```bash
cd frontend
pnpm install
pnpm dev
```

*Menjalankan Testing*
```bash
cd backend
pnpm test:cov
pnpm test:e2e
```
