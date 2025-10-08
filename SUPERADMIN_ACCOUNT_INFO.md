# 🔐 Akun Super Administrator - Dokumentasi

**Tanggal Pembuatan:** 8 Oktober 2025  
**Status:** ✅ Aktif  
**Dibuat oleh:** Hafiz

---

## 📋 Kredensial Login

```
Username: superadmin
Password: admin123
Role: SUPER_ADMIN
```

**URL Login:** `http://localhost:3000/login`

---

## 🎯 Detail Akun

| Field | Value |
|-------|-------|
| **ID** | `0de6ddef-bc6a-4dba-831e-9b8bb18c3a88` |
| **Username** | `superadmin` |
| **Nama Lengkap** | `Super Administrator` |
| **NRP/NIP** | `SUPERADMIN001` |
| **Role** | `SUPER_ADMIN` |
| **Status** | 🟢 Aktif |
| **Created** | 8 Oktober 2025 |

---

## ✨ Hak Akses Super Admin

Akun **SUPER_ADMIN** memiliki akses penuh ke semua fitur sistem:

### 📊 Dashboard
- ✅ Lihat statistik lengkap
- ✅ Akses semua data

### 📝 Manajemen Surat
- ✅ Tambah surat baru
- ✅ Edit semua surat
- ✅ Hapus surat (soft delete)
- ✅ Restore surat dari trash
- ✅ Permanent delete
- ✅ Bulk operations (delete, restore)

### 👥 Manajemen User
- ✅ Lihat semua user
- ✅ Tambah user baru (Admin/Super Admin)
- ✅ Edit user
- ✅ Hapus user (soft delete)
- ✅ Restore user
- ✅ Reset password user lain

### 🗂️ Arsip
- ✅ Akses semua arsip surat
- ✅ Filter & search
- ✅ Export ke Excel
- ✅ Sorting & pagination

### 🗑️ Trash Management
- ✅ Lihat semua item terhapus
- ✅ Restore individual/bulk
- ✅ Permanent delete individual/bulk

---

## 🛠️ Scripts Management

### Membuat Akun Baru / Reset Password

Jika perlu membuat ulang atau reset password:

```powershell
cd "c:\Users\hafiz\OneDrive - Institut Teknologi Sumatera\_CODING\Projek_KP\siad-tik-polda"
npx tsx create-superadmin.ts
```

**Fitur script:**
- ✅ Auto-detect jika user sudah ada
- ✅ Auto-restore jika user ter-soft delete
- ✅ Auto-reset password jika user aktif
- ✅ Hash password dengan bcrypt

### Verifikasi Akun

Untuk memverifikasi akun sudah dibuat dengan benar:

```powershell
npx tsx verify-superadmin.ts
```

**Output verifikasi:**
- ✅ Detail user lengkap
- ✅ Test password
- ✅ Status aktif/tidak

### Reset Password Only

Jika hanya perlu reset password (user sudah ada):

```powershell
npx tsx reset-superadmin.ts
```

### Cek Status Akun

```powershell
npx tsx check-superadmin.ts
```

---

## ⚠️ Keamanan & Best Practices

### 🔒 PENTING - Segera Lakukan Ini!

1. **Ganti Password Default**
   - ⚠️ Password `admin123` adalah password sementara
   - Segera ganti setelah login pertama kali
   - Gunakan password yang kuat (min 8 karakter, kombinasi huruf besar/kecil, angka, simbol)

2. **Jangan Share Kredensial**
   - ❌ Jangan share username/password ke orang lain
   - ❌ Jangan simpan di tempat yang mudah diakses
   - ✅ Simpan di password manager yang aman

3. **Monitoring Activity**
   - Secara berkala cek aktivitas login
   - Cek perubahan data yang dilakukan
   - Review user management

### 🛡️ Rekomendasi Password Baru

Setelah login, ganti password dengan yang memenuhi kriteria:

```
✅ Minimal 12 karakter
✅ Kombinasi huruf besar & kecil
✅ Minimal 2 angka
✅ Minimal 1 simbol (!@#$%^&*)
✅ Tidak mudah ditebak
✅ Tidak menggunakan informasi pribadi

Contoh password kuat:
- SuperAdm!n2025#Secure
- P0ld@TikM@ster$2025
- Adm1n!Str0ng#Pass
```

---

## 📝 Cara Mengganti Password

### Via UI (Recommended)

1. Login ke sistem dengan kredensial superadmin
2. Klik profile/avatar di pojok kanan atas
3. Pilih "Profile" atau "Pengaturan"
4. Cari menu "Ubah Password"
5. Masukkan password lama: `admin123`
6. Masukkan password baru yang kuat
7. Konfirmasi password baru
8. Klik "Simpan"

### Via Script (Alternatif)

Edit file `reset-superadmin.ts`, ubah baris:
```typescript
const newPassword = 'admin123'; // Ganti dengan password baru Anda
```

Lalu jalankan:
```powershell
npx tsx reset-superadmin.ts
```

---

## 🔄 Troubleshooting

### Problem: Tidak bisa login

**Solusi:**
1. Verifikasi kredensial dengan script:
   ```powershell
   npx tsx verify-superadmin.ts
   ```

2. Reset password:
   ```powershell
   npx tsx reset-superadmin.ts
   ```

3. Cek status akun (deleted/aktif):
   ```powershell
   npx tsx check-superadmin.ts
   ```

### Problem: Username sudah digunakan

**Solusi:**
Script `create-superadmin.ts` sudah handle ini otomatis:
- Jika user aktif → Reset password
- Jika user ter-delete → Restore & reset password

### Problem: Lupa password

**Solusi:**
```powershell
npx tsx reset-superadmin.ts
```

Password akan di-reset ke `admin123`

---

## 📊 Database Information

### Table: `pengguna`

```sql
SELECT * FROM pengguna 
WHERE username = 'superadmin' 
AND "deletedAt" IS NULL;
```

### Struktur Data

```typescript
{
  id: "0de6ddef-bc6a-4dba-831e-9b8bb18c3a88",
  username: "superadmin",
  password: "$2a$10$[hashed_password]",
  nama: "Super Administrator",
  nrp_nip: "SUPERADMIN001",
  role: "SUPER_ADMIN",
  profilePictureUrl: null,
  createdAt: "2025-10-08T11:37:25.000Z",
  updatedAt: "2025-10-08T11:37:25.000Z",
  deletedAt: null
}
```

---

## 📚 File-File Terkait

| File | Fungsi |
|------|--------|
| `create-superadmin.ts` | Membuat akun baru / reset jika sudah ada |
| `verify-superadmin.ts` | Verifikasi akun & test password |
| `reset-superadmin.ts` | Reset password ke default |
| `check-superadmin.ts` | Cek status dan detail akun |
| `test-superadmin-login.ts` | Test login functionality |

---

## 🚀 Production Deployment

### ⚠️ BEFORE Production

1. **WAJIB ganti password default!**
   - Jangan deploy ke production dengan password `admin123`
   
2. **Setup environment variables**
   ```env
   SUPERADMIN_USERNAME=superadmin
   SUPERADMIN_PASSWORD=[use strong password]
   ```

3. **Buat backup script**
   - Backup credentials di tempat aman
   - Setup recovery mechanism

### Production Checklist

- [ ] Password sudah diganti dari default
- [ ] Password memenuhi kriteria keamanan
- [ ] Credentials disimpan di password manager
- [ ] Environment variables sudah diset
- [ ] Database backup tersedia
- [ ] Recovery script sudah ditest
- [ ] Monitoring login sudah aktif

---

## 📞 Support

Jika mengalami masalah:

1. Cek dokumentasi ini terlebih dahulu
2. Jalankan troubleshooting steps
3. Cek error logs di console
4. Hubungi developer: Hafiz

---

## 📝 Changelog

### 8 Oktober 2025 - Initial Creation
- ✅ Akun superadmin dibuat
- ✅ Username: `superadmin`
- ✅ Password default: `admin123`
- ✅ Role: `SUPER_ADMIN`
- ✅ Status: Aktif
- ✅ Verifikasi: Passed

---

## ⚡ Quick Commands Reference

```powershell
# Buat/Reset akun superadmin
npx tsx create-superadmin.ts

# Verifikasi akun
npx tsx verify-superadmin.ts

# Reset password
npx tsx reset-superadmin.ts

# Cek status
npx tsx check-superadmin.ts

# Test login
npx tsx test-superadmin-login.ts
```

---

**Status:** ✅ Ready to Use  
**Security:** ⚠️ Change default password immediately!  
**Last Updated:** 8 Oktober 2025

---

## 🎉 Summary

✅ Akun super administrator berhasil dibuat dan siap digunakan!

**Login sekarang:**
1. Buka `http://localhost:3000/login`
2. Username: `superadmin`
3. Password: `admin123`
4. **Segera ganti password setelah login!**

**Enjoy your full system access! 🚀**
