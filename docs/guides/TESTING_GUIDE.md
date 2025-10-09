# 🧪 Panduan Testing Login SUPER_ADMIN

## ✅ Kredensial Login

```
Username: superadmin
Password: admin123
```

## 📝 Langkah-langkah Testing

### 1. Start Development Server
```bash
npm run dev
```

### 2. Akses Halaman Login
```
http://localhost:3000/login
```

### 3. Test Login
1. Masukkan username: `superadmin`
2. Masukkan password: `admin123`
3. Klik "Masuk ke Dashboard"
4. ✅ Seharusnya berhasil redirect ke `/dashboard`

### 4. Verifikasi Akses SUPER_ADMIN
Setelah login, cek hal berikut:

#### ✅ Navbar
- Seharusnya ada menu "Manajemen User" atau "Admin"
- Seharusnya bisa akses semua menu

#### ✅ Akses /admin/users
1. Buka `http://localhost:3000/admin/users`
2. Seharusnya BISA melihat daftar semua user
3. Seharusnya BISA membuat user baru (hanya role ADMIN)
4. Seharusnya BISA edit user lain
5. Seharusnya TIDAK BISA hapus akun SUPER_ADMIN

#### ✅ Akses Dashboard
1. Buka `http://localhost:3000/dashboard`
2. Seharusnya bisa melihat statistik surat
3. Seharusnya bisa CRUD surat

### 5. Test Ganti Password
1. Klik profil di navbar
2. Pilih "Ubah Password"
3. Masukkan password lama: `admin123`
4. Masukkan password baru (minimal 8 karakter)
5. Klik "Update"
6. ✅ Seharusnya berhasil
7. Logout dan login dengan password baru

### 6. Test Proteksi Soft-Delete (Optional)

#### A. Via Prisma Studio
```bash
npx prisma studio
```
1. Buka `http://localhost:5555`
2. Pilih tabel `pengguna`
3. Edit record SUPER_ADMIN
4. Set `deletedAt` ke tanggal sekarang
5. Save
6. Coba login dengan superadmin
7. ✅ Seharusnya DITOLAK
8. Kembalikan `deletedAt` ke null
9. Login lagi seharusnya BERHASIL

#### B. Via Script
```bash
npx ts-node check-superadmin.ts
```
Script ini akan otomatis memperbaiki jika ada masalah

## 🔧 Troubleshooting

### ❌ Login Gagal - "Username atau password salah"

**Solusi 1: Reset Password**
```bash
npx ts-node reset-superadmin.ts
```

**Solusi 2: Cek Database**
```bash
npx ts-node check-superadmin.ts
```

**Solusi 3: Cek Environment Variable**
Pastikan `.env` punya `JWT_SECRET`:
```env
JWT_SECRET=your-secret-key-here
DATABASE_URL=postgresql://...
```

### ❌ Redirect ke Login Terus

**Kemungkinan Penyebab:**
1. JWT_SECRET tidak match
2. Cookie tidak tersimpan (cek browser settings)
3. Middleware issue

**Solusi:**
1. Clear browser cookies
2. Restart dev server
3. Cek console browser (F12) untuk error

### ❌ Error 500 - Server Error

**Cek:**
1. Database connection (apakah Postgres running?)
2. Prisma client (sudah generate?)
   ```bash
   npx prisma generate
   ```
3. Log error di terminal

### ❌ Tidak bisa akses /admin/users

**Kemungkinan:**
1. Role bukan SUPER_ADMIN atau ADMIN
2. Token expired
3. Middleware blocking

**Solusi:**
```bash
# Cek role di database
npx ts-node check-superadmin.ts

# Logout dan login ulang
```

## 🎯 Expected Results

| Test Case | Expected Result | Status |
|-----------|----------------|--------|
| Login dengan kredensial valid | ✅ Redirect ke /dashboard | |
| Login dengan password salah | ❌ Error "Username atau password salah" | |
| Login dengan akun soft-deleted | ❌ Error "Username atau password salah" | |
| Akses /admin/users sebagai SUPER_ADMIN | ✅ Bisa akses | |
| Hapus akun SUPER_ADMIN | ❌ Ditolak dengan pesan error | |
| Buat user SUPER_ADMIN baru | ❌ Ditolak dengan pesan error | |
| Ganti password sendiri | ✅ Berhasil | |
| Logout | ✅ Redirect ke /login | |

## 📊 Tools Bantu

### 1. Check SUPER_ADMIN Status
```bash
npx ts-node check-superadmin.ts
```

### 2. Reset Password SUPER_ADMIN
```bash
npx ts-node reset-superadmin.ts
```

### 3. Open Prisma Studio
```bash
npx prisma studio
```
Buka: http://localhost:5555

### 4. View Database Directly
```bash
# Connect ke PostgreSQL
psql -U your_username -d your_database

# Query SUPER_ADMIN
SELECT id, nama, username, role, "deletedAt" FROM pengguna WHERE role = 'SUPER_ADMIN';
```

## ✨ Tips

1. **Selalu gunakan Incognito/Private browsing** saat testing untuk menghindari cache issues
2. **Clear cookies** sebelum test login ulang
3. **Check browser console (F12)** untuk error JavaScript
4. **Check terminal** untuk error server-side
5. **Gunakan script bantuan** untuk diagnostik cepat

---

**Last Updated:** 7 Oktober 2025
