# 🚀 QUICK START - Log Activity System

## ⚡ Langkah Cepat (5 Menit)

### 1️⃣ Execute Migration
```powershell
# Option A: PostgreSQL CLI (Fastest)
psql $env:DATABASE_URL -f migrations/manual_add_activity_log.sql

# Option B: Copy-paste SQL
# Buka migrations/manual_add_activity_log.sql
# Copy semua isi → Paste di pgAdmin/DBeaver → Execute
```

### 2️⃣ Generate Prisma Client
```powershell
npx prisma generate
```

### 3️⃣ Start Server
```powershell
npm run dev
```

### 4️⃣ Test Fitur
1. **Login ulang** (untuk JWT baru dengan username & nama)
2. Klik **Profile** → **Log Aktivitas**
3. Lihat log login yang baru saja dilakukan
4. Test **filter**, **search**, dan **export CSV**

---

## ✅ Checklist Testing (3 Menit)

- [ ] Migration berhasil (no errors)
- [ ] Server berjalan tanpa error
- [ ] Login berhasil (dapat JWT baru)
- [ ] Halaman `/log-activity` bisa diakses
- [ ] Log activity tercatat saat login/logout
- [ ] Filter bekerja (category, type, date)
- [ ] Search berfungsi
- [ ] Export CSV berhasil download
- [ ] Stats cards menampilkan angka yang benar
- [ ] Super Admin bisa lihat semua log
- [ ] Admin hanya lihat log sendiri

---

## 🐛 Troubleshooting Cepat

### Error: "type ActivityCategory already exists"
```powershell
# DROP manual dulu
psql $env:DATABASE_URL -c "DROP TYPE IF EXISTS \"ActivityCategory\" CASCADE;"
psql $env:DATABASE_URL -c "DROP TYPE IF EXISTS \"ActivityType\" CASCADE;"
psql $env:DATABASE_URL -c "DROP TABLE IF EXISTS activity_log CASCADE;"

# Jalankan lagi migration
psql $env:DATABASE_URL -f migrations/manual_add_activity_log.sql
```

### Error: "Property 'username' does not exist"
```
✅ SUDAH DIPERBAIKI! 
File yang diupdate:
- types/session.ts (baru)
- src/lib/session.ts (updated)
- src/app/api/auth/login/route.ts (updated)

Solusi: Login ulang untuk dapat JWT baru
```

### Error: "Cannot find module '@/types/session'"
```
✅ SUDAH DIPERBAIKI!
Menggunakan relative path: '../../types/session'
```

### Halaman /log-activity blank/error
```powershell
# Check console browser untuk error
# Check terminal untuk server error
# Pastikan migration sudah dijalankan
# Pastikan sudah login ulang
```

---

## 📚 Dokumentasi Lengkap

| Butuh Info | Lihat File |
|------------|-----------|
| 🚀 Quick Start | File ini |
| 📖 Overview | `LOG_ACTIVITY_README.md` |
| 🔧 Setup Detail | `LOG_ACTIVITY_SETUP_GUIDE.md` |
| 📋 Full Docs | `LOG_ACTIVITY_FULL_DOCUMENTATION.md` |
| ⚡ Quick Ref | `LOG_ACTIVITY_QUICKREF.md` |
| 👨‍💻 Add Logging | `HOW_TO_ADD_LOGGING.md` |
| 🎨 UI Guide | `LOG_ACTIVITY_VISUAL_GUIDE.md` |
| ✅ Testing | `LOG_ACTIVITY_FINAL_CHECKLIST.md` |
| 🗄️ Migration | `EXECUTE_MIGRATION.md` |
| 🐛 Bug Fix | `LOG_ACTIVITY_BUGFIX_SESSION.md` |
| 📊 Status | `LOG_ACTIVITY_STATUS_FINAL.md` |
| 📑 Index | `LOG_ACTIVITY_INDEX.md` |

---

## 💡 Tips

1. **Test di development dulu** sebelum production
2. **Backup database** sebelum run migration
3. **Inform users** untuk login ulang setelah deployment
4. **Monitor logs** untuk detect issues awal
5. **Export CSV** untuk reporting ke atasan

---

## 🎯 One-Liner Commands

```powershell
# All-in-one (jalankan satu per satu)
psql $env:DATABASE_URL -f migrations/manual_add_activity_log.sql; npx prisma generate; npm run dev
```

---

**Status**: ✅ READY  
**Time to Deploy**: ⏱️ 5 menit  
**Difficulty**: 🟢 Easy

🚀 **Let's Go!**
