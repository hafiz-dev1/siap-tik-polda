# 🔑 SUPERADMIN - Quick Reference

**Last Updated:** 8 Oktober 2025

---

## 📝 LOGIN CREDENTIALS

```
Username: superadmin
Password: admin123
URL: http://localhost:3000/login
```

⚠️ **SEGERA GANTI PASSWORD SETELAH LOGIN PERTAMA KALI!**

---

## 📋 Account Details

| Field | Value |
|-------|-------|
| **Username** | `superadmin` |
| **Password** | `admin123` (default - GANTI SEGERA!) |
| **Role** | `SUPER_ADMIN` |
| **Nama** | Super Administrator |
| **NRP/NIP** | `SUPERADMIN001` |
| **Status** | 🟢 Aktif |
| **Created** | 8 Oktober 2025 |

---

## ⚡ Quick Commands

### Buat/Reset Superadmin
```powershell
npx tsx create-superadmin.ts
```
**Fungsi:** Buat akun baru atau reset password jika sudah ada

### Verifikasi Akun
```powershell
npx tsx verify-superadmin.ts
```
**Fungsi:** Cek status akun dan test password

### Reset Password ke Default
```powershell
npx tsx reset-superadmin.ts
```
**Fungsi:** Reset password kembali ke `admin123`

### Check Status
```powershell
npx tsx check-superadmin.ts
```
**Fungsi:** Lihat detail lengkap akun superadmin

---

## 🚀 Development Commands

### Start Development Server
```powershell
npm run dev
```

### Open Prisma Studio (Database GUI)
```powershell
npx prisma studio
```

### Database Migrations
```powershell
# Apply schema changes
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

---

## 🎯 URL Penting

| URL | Fungsi |
|-----|--------|
| `http://localhost:3000/login` | Login Page |
| `http://localhost:3000/dashboard` | Dashboard Admin |
| `http://localhost:3000/arsip` | Arsip Surat |
| `http://localhost:3000/admin/users` | User Management |
| `http://localhost:3000/admin/trash` | Trash Management |
| `http://localhost:5555` | Prisma Studio |

---

## 🎯 Access Rights (SUPER_ADMIN)

✅ **Full System Access:**
- ✅ Lihat & manage semua surat
- ✅ Tambah, edit, hapus surat
- ✅ Bulk operations (delete, restore)
- ✅ User management (create, edit, delete users)
- ✅ Reset password user lain
- ✅ Trash management (restore, permanent delete)
- ✅ Export data ke Excel
- ✅ Access all statistics

---

## 🔒 Security Checklist

**Setelah Login Pertama Kali:**

- [ ] ✅ Login berhasil dengan `superadmin` / `admin123`
- [ ] ✅ Akses dashboard berhasil
- [ ] ⚠️ **GANTI PASSWORD** via Profile → Ubah Password
- [ ] ✅ Test login dengan password baru
- [ ] ✅ Simpan password baru di password manager
- [ ] ✅ Hapus/amankan file dengan password default

**Password Baru Harus:**
- Minimal 12 karakter
- Kombinasi huruf besar & kecil
- Mengandung angka dan simbol
- Tidak mudah ditebak

---

## 📚 Documentation Files

| File | Deskripsi |
|------|-----------|
| `SUPERADMIN_ACCOUNT_INFO.md` | Dokumentasi lengkap akun superadmin |
| `SUPERADMIN_QUICKREF.md` | Quick reference (file ini) |
| `create-superadmin.ts` | Script buat/reset superadmin |
| `verify-superadmin.ts` | Script verifikasi akun |
| `reset-superadmin.ts` | Script reset password |
| `check-superadmin.ts` | Script cek status akun |

---

## 🆘 Troubleshooting

### ❌ Tidak Bisa Login

**Solusi:**
```powershell
# 1. Verifikasi akun
npx tsx verify-superadmin.ts

# 2. Reset password
npx tsx reset-superadmin.ts

# 3. Coba login lagi dengan admin123
```

### ❌ Lupa Password

**Solusi:**
```powershell
npx tsx reset-superadmin.ts
```
Password akan di-reset ke `admin123`

### ❌ Akun Ter-delete (Soft Delete)

**Solusi:**
```powershell
npx tsx create-superadmin.ts
```
Script akan auto-restore akun dan reset password

---

## 💡 Tips & Tricks

### 1. Quick Login Test
Setelah membuat akun, langsung test:
```powershell
npx tsx verify-superadmin.ts
```

### 2. Backup Credentials
Simpan di password manager seperti:
- LastPass
- 1Password
- Bitwarden
- KeePass

### 3. Development Workflow
```powershell
# 1. Start dev server
npm run dev

# 2. Open Prisma Studio (optional)
npx prisma studio

# 3. Login ke http://localhost:3000/login
```

---

## 📊 Database Info

**Table:** `pengguna`

**Query untuk cek superadmin:**
```sql
SELECT id, username, nama, role, "deletedAt"
FROM pengguna 
WHERE username = 'superadmin';
```

**ID Akun:** `0de6ddef-bc6a-4dba-831e-9b8bb18c3a88`

---

## ✅ Status Implementation

- [x] Akun superadmin dibuat
- [x] Password di-hash dengan bcrypt
- [x] Role set ke SUPER_ADMIN
- [x] Akun aktif (deletedAt: null)
- [x] Verifikasi passed
- [x] Dokumentasi complete
- [ ] Password default sudah diganti (TODO by user)

---

**Created:** 8 Oktober 2025  
**Status:** ✅ Ready to Use  
**Security Level:** ⚠️ Change default password ASAP!

---

## 🎉 Quick Start

```powershell
# 1. Pastikan dev server running
npm run dev

# 2. Buka browser
http://localhost:3000/login

# 3. Login dengan:
Username: superadmin
Password: admin123

# 4. GANTI PASSWORD SEGERA!
Profile → Ubah Password
```

**Selamat menggunakan sistem! 🚀**

- Login: `http://localhost:3000/login`
- Dashboard: `http://localhost:3000/dashboard`
- User Management: `http://localhost:3000/admin/users`
- Prisma Studio: `http://localhost:5555`

## ✅ Perbaikan yang Dilakukan

1. ✅ Fixed login route - sekarang memeriksa soft-delete status
2. ✅ Reset password SUPER_ADMIN ke `admin123`
3. ✅ Verified akun SUPER_ADMIN aktif (deletedAt: null)
4. ✅ Added diagnostic scripts untuk monitoring

## 📝 File Penting

| File | Fungsi |
|------|--------|
| `src/app/api/auth/login/route.ts` | Login endpoint (FIXED) |
| `src/middleware.ts` | Route protection & role checking |
| `src/lib/session.ts` | JWT session management |
| `check-superadmin.ts` | Diagnostic script |
| `reset-superadmin.ts` | Password reset script |

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Soft-delete protection
- ✅ Role-based access control
- ✅ SUPER_ADMIN cannot be deleted
- ✅ SUPER_ADMIN cannot create another SUPER_ADMIN
- ✅ Password hashing with bcrypt

## 📞 Support

Jika ada masalah:
1. Cek file `SUPERADMIN_FIX_REPORT.md` untuk detail lengkap
2. Cek file `TESTING_GUIDE.md` untuk panduan testing
3. Jalankan `npx ts-node check-superadmin.ts` untuk diagnostik
