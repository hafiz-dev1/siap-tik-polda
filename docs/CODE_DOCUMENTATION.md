
# Dokumentasi Kode Aplikasi SIAP (Sistem Informasi Arsip Polda)

## 1. Pendahuluan

Dokumen ini memberikan analisis dan dokumentasi teknis dari kode sumber aplikasi **SIAP**. Tujuannya adalah untuk memberikan pemahaman yang jelas tentang arsitektur, fungsionalitas, dan alur kerja aplikasi kepada pengembang.

Aplikasi ini dibangun menggunakan **Next.js (App Router)**, **TypeScript**, **Prisma** sebagai ORM, dan **PostgreSQL** sebagai database.

## 2. Struktur Proyek

Berikut adalah gambaran umum struktur direktori `src`:

```
src/
├── app/
│   ├── (app)/                # Grup rute untuk halaman yang memerlukan autentikasi
│   │   ├── admin/            # Halaman dan aksi untuk manajemen admin
│   │   ├── arsip/            # Halaman untuk manajemen arsip surat
│   │   ├── dashboard/        # Halaman dashboard utama
│   │   ├── log-activity/     # Halaman untuk melihat log aktivitas
│   │   ├── profile/          # Halaman profil pengguna
│   │   └── layout.tsx        # Layout untuk halaman terautentikasi
│   ├── api/                  # Rute API (API Routes)
│   │   ├── auth/             # API untuk autentikasi (login)
│   │   └── ...
│   ├── components/           # Komponen React yang dapat digunakan kembali
│   ├── hooks/                # Custom hooks React
│   ├── login/                # Halaman login
│   ├── layout.tsx            # Layout root aplikasi
│   └── globals.css           # File CSS global
├── lib/                      # Pustaka dan utilitas helper
│   ├── activityLogger.ts     # Fungsi untuk mencatat aktivitas pengguna
│   ├── prisma.ts             # Inisialisasi instance Prisma Client
│   ├── session.ts            # Fungsi untuk manajemen sesi (JWT)
│   └── trashRetention.ts     # Logika untuk retensi data di tempat sampah
└── middleware.ts             # Middleware untuk proteksi rute dan autentikasi
```

## 3. Analisis File Kunci

### 3.1. `src/middleware.ts`

- **Tujuan**: File ini berfungsi sebagai garda terdepan untuk keamanan rute. Middleware ini berjalan sebelum sebuah permintaan (request) selesai diproses.
- **Fungsionalitas**:
    - **Proteksi Rute**: Memastikan hanya pengguna yang sudah login yang dapat mengakses halaman-halaman privat (seperti `/dashboard`, `/arsip`, dll.).
    - **Pengalihan (Redirect)**: Mengalihkan pengguna yang belum login ke halaman `/login`. Sebaliknya, pengguna yang sudah login dan mencoba mengakses `/login` akan dialihkan ke `/dashboard`.
    - **Manajemen Peran (Role-Based Access Control - RBAC)**: Membatasi akses ke halaman admin (`/admin/**`) hanya untuk pengguna dengan peran `ADMIN` atau `SUPER_ADMIN`.
    - **Pengecualian Aset Statis**: Mengizinkan akses publik ke aset seperti gambar, CSS, dan file JavaScript tanpa perlu login.

### 3.2. `src/lib/session.ts`

- **Tujuan**: Mengelola sesi pengguna menggunakan JSON Web Tokens (JWT).
- **Fungsionalitas**:
    - `getSession()`: Fungsi ini membaca token JWT dari cookie, memverifikasinya menggunakan `jose`, dan mengembalikan payload token (informasi pengguna seperti `operatorId`, `role`, `username`). Jika token tidak valid atau tidak ada, fungsi ini akan mengembalikan `null`.

### 3.3. `src/lib/prisma.ts`

- **Tujuan**: Menginisialisasi dan mengekspor satu instance dari `PrismaClient`.
- **Fungsionalitas**: Menerapkan pola *singleton* untuk memastikan hanya ada satu koneksi Prisma yang aktif di seluruh aplikasi, yang penting untuk efisiensi dan menghindari kehabisan koneksi database.

### 3.4. `src/lib/activityLogger.ts`

- **Tujuan**: Menyediakan fungsi terpusat untuk mencatat semua aktivitas penting yang dilakukan pengguna.
- **Fungsionalitas**:
    - `logActivity()`: Fungsi utama yang menerima detail aktivitas (seperti ID pengguna, kategori, tipe, dan deskripsi) dan menyimpannya ke dalam tabel `ActivityLog` di database.
    - `getIpAddress()` & `getUserAgent()`: Fungsi pembantu untuk mendapatkan alamat IP dan user agent dari permintaan (request) untuk tujuan audit.

## 4. Alur Kerja Utama

### 4.1. Alur Autentikasi (Login)

1.  **Halaman Login (`src/app/login/page.tsx`)**: Pengguna memasukkan `username` dan `password`.
2.  **API Endpoint (`src/app/api/auth/login/route.ts`)**:
    - Menerima kredensial dari klien.
    - Mencari pengguna di database berdasarkan `username`.
    - Memverifikasi `password` menggunakan `bcrypt.compare()`.
    - Jika valid, membuat token JWT yang berisi `operatorId`, `role`, dan `username`.
    - Mengirim token tersebut kembali ke klien dalam bentuk `HttpOnly` cookie.
    - Mencatat aktivitas login (berhasil atau gagal) menggunakan `logActivity()`.
3.  **Middleware (`src/middleware.ts`)**: Pada permintaan berikutnya, middleware akan mendeteksi cookie token, memverifikasinya, dan memberikan akses ke halaman yang dilindungi.

### 4.2. Alur Manajemen Surat (CRUD)

Semua operasi Create, Read, Update, Delete (CRUD) pada surat dikelola melalui **Server Actions** yang didefinisikan di `src/app/(app)/admin/actions.ts`.

- **Create/Update**:
    1.  Formulir di komponen klien (`SuratFormModal.tsx`) diisi oleh pengguna.
    2.  Saat disubmit, Server Action `createSurat` atau `updateSurat` dipanggil.
    3.  Aksi ini berjalan di server, memvalidasi data, dan berinteraksi langsung dengan Prisma untuk menyimpan atau memperbarui data di database.
    4.  `revalidatePath('/arsip')` dipanggil untuk memberitahu Next.js agar memuat ulang data di halaman arsip.
- **Delete (Soft Delete)**:
    1.  Tombol hapus di `SuratTable.tsx` memicu Server Action `deleteSurat`.
    2.  Aksi ini tidak menghapus data dari database, melainkan mengisi kolom `deletedAt` dengan tanggal saat ini.
    3.  Data yang sudah di-soft-delete tidak akan muncul lagi di halaman arsip utama tetapi akan tersedia di halaman "Kotak Sampah".
- **Permanent Delete/Restore**:
    - Aksi serupa (`deleteSuratPermanently`, `restoreSurat`) tersedia di halaman "Kotak Sampah" (`src/app/(app)/admin/trash/page.tsx`) untuk mengelola data yang sudah di-soft-delete.

## 5. Komponen Penting

- **`SuratDashboardClient.tsx`**: Komponen utama di halaman `/arsip`. Bertanggung jawab untuk menampilkan tabel surat, fungsionalitas pencarian, filter, pagination, dan memanggil modal untuk membuat/mengedit surat.
- **`UserTableClient.tsx`**: Komponen serupa untuk halaman manajemen pengguna (`/admin/users`).
- **`ModernNavbar.tsx`**: Navbar utama aplikasi yang menampilkan informasi pengguna dan tombol logout.
- **`LiveDateTime.tsx`**: Komponen sederhana yang menampilkan tanggal dan waktu saat ini secara real-time di sisi klien.
- **`TrashSuratWithPagination.tsx` & `TrashUsersWithPagination.tsx`**: Komponen yang menampilkan data yang telah di-soft-delete di halaman "Kotak Sampah", lengkap dengan tombol untuk memulihkan atau menghapus permanen.

## 6. Rute API

Selain halaman, aplikasi ini juga memiliki beberapa rute API:

- **`GET /api/auth/login`**: (Seharusnya `POST`) Untuk proses login.
- **`GET /api/health/activity-log`**: Endpoint untuk memeriksa kesehatan tabel `ActivityLog`.
- **`GET /api/surat/statistik`**: Menyediakan data statistik untuk chart di dashboard.
- **`GET /api/test-db-schema`**: Endpoint khusus SUPER_ADMIN untuk memverifikasi skema database di lingkungan produksi.

## 7. Kesimpulan Analisis

- **Arsitektur Modern**: Penggunaan Next.js App Router dengan Server Components dan Server Actions membuat aplikasi ini efisien, karena sebagian besar logika bisnis dan pengambilan data terjadi di server.
- **Keamanan**: Keamanan ditangani dengan baik melalui middleware untuk proteksi rute dan RBAC, serta penggunaan `HttpOnly` cookie untuk token JWT.
- **Manajemen State**: Aplikasi ini meminimalkan manajemen state di sisi klien dengan mengandalkan Server Actions dan `revalidatePath` untuk menjaga data tetap sinkron.
- **Penanganan File**: Penyimpanan file (scan surat dan foto profil) diimplementasikan menggunakan **Base64 encoding** yang disimpan langsung di database. Ini adalah solusi yang baik untuk lingkungan *serverless* seperti Vercel, karena tidak bergantung pada sistem file persisten.
- **Logging**: Sistem logging aktivitas yang terpusat adalah praktik yang sangat baik untuk audit dan pelacakan.
- **Soft Delete**: Implementasi soft delete untuk surat dan pengguna adalah fitur keamanan yang penting, memungkinkan pemulihan data jika terjadi kesalahan.
