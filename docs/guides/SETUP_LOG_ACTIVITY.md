# 🚀 SETUP LOG ACTIVITY FEATURE

## Step-by-Step Installation Guide

### Prerequisites
- PostgreSQL database sudah berjalan
- Node.js dan npm sudah terinstall
- Prisma CLI sudah terinstall

---

## 📋 Installation Steps

### Step 1: Generate Prisma Migration
```powershell
# Generate migration untuk ActivityLog model
npx prisma migrate dev --name add_activity_log_feature
```

**Output yang diharapkan:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "..."

Applying migration `20251009_add_activity_log_feature`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20251009_add_activity_log_feature/
      └─ migration.sql

✔ Generated Prisma Client to .\node_modules\@prisma\client
```

### Step 2: Generate Prisma Client
```powershell
# Regenerate Prisma Client dengan model baru
npx prisma generate
```

**Output yang diharapkan:**
```
✔ Generated Prisma Client to .\node_modules\@prisma\client
```

### Step 3: Verify Database Schema
```powershell
# Check database schema
npx prisma studio
```

Atau check langsung di database:
```sql
-- Verify ActivityLog table exists
SELECT * FROM activity_log LIMIT 1;

-- Check enum types
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'ActivityCategory'
);
```

### Step 4: Test the Application
```powershell
# Run development server
npm run dev
```

### Step 5: Test Log Activity Feature

1. **Login ke aplikasi**
   - Buka http://localhost:3000
   - Login dengan user yang ada
   - Check bahwa login berhasil

2. **Akses halaman Log Activity**
   - Klik avatar/nama user di navbar
   - Pilih "Log Aktivitas"
   - Verify halaman terbuka dengan benar

3. **Test Create Surat**
   - Buat surat baru
   - Check bahwa log tercatat di halaman Log Activity

4. **Test Filter & Search**
   - Coba filter berdasarkan kategori
   - Coba search berdasarkan keyword
   - Coba filter berdasarkan tanggal

5. **Test Export CSV**
   - Klik tombol "Export CSV"
   - Verify file CSV terdownload
   - Buka file CSV dan check isinya

---

## ✅ Verification Checklist

- [ ] Migration berhasil dijalankan
- [ ] Prisma Client berhasil di-generate
- [ ] Table `activity_log` ada di database
- [ ] Enum `ActivityCategory` dan `ActivityType` terbuat
- [ ] Aplikasi bisa running tanpa error
- [ ] Login tercatat di log activity
- [ ] Halaman Log Activity bisa diakses
- [ ] Filter dan search berfungsi
- [ ] Export CSV berfungsi
- [ ] Role-based access berfungsi (Super Admin vs Admin)

---

## 🔧 Troubleshooting

### Error: "Migration failed"

**Possible causes:**
1. Database connection error
2. Duplicate enum types
3. Permission issues

**Solution:**
```powershell
# Reset database (WARNING: This will delete all data!)
npx prisma migrate reset

# Or manually drop conflicting enums
# Execute in PostgreSQL:
# DROP TYPE IF EXISTS "ActivityCategory" CASCADE;
# DROP TYPE IF EXISTS "ActivityType" CASCADE;

# Then run migration again
npx prisma migrate dev --name add_activity_log_feature
```

### Error: "Prisma Client does not exist"

**Solution:**
```powershell
# Regenerate Prisma Client
npx prisma generate
```

### Error: "Cannot find module '@/lib/activityLogger'"

**Solution:**
- Verify file `src/lib/activityLogger.ts` exists
- Check import path is correct
- Restart TypeScript server (VS Code: Ctrl+Shift+P → "Restart TS Server")

### Logs tidak muncul di UI

**Checklist:**
1. Check browser console untuk error
2. Check server terminal untuk error
3. Verify login berhasil dan session valid
4. Check database apakah log tersimpan:
```sql
SELECT * FROM activity_log ORDER BY "createdAt" DESC LIMIT 10;
```

---

## 🎯 Next Steps

Setelah instalasi berhasil, Anda bisa:

1. **Tambahkan logging ke fungsi lain**
   - Edit `src/app/(app)/admin/actions.ts`
   - Tambahkan logging ke fungsi yang belum ada

2. **Customize UI**
   - Edit `src/app/(app)/log-activity/ActivityLogClient.tsx`
   - Sesuaikan warna, layout, atau komponen

3. **Tambahkan kategori/tipe baru**
   - Edit `prisma/schema.prisma`
   - Tambahkan enum baru
   - Run migration

4. **Setup email notification** (optional)
   - Untuk aktivitas kritis (failed login, permanent delete, dll)

---

## 📚 Documentation

- **Full Documentation:** `LOG_ACTIVITY_DOCUMENTATION.md`
- **Quick Reference:** `LOG_ACTIVITY_QUICKREF.md`
- **This File:** `SETUP_LOG_ACTIVITY.md`

---

## 🆘 Support

Jika mengalami masalah:
1. Check dokumentasi di atas
2. Check error message di console
3. Review kode yang baru ditambahkan
4. Check database langsung menggunakan Prisma Studio

---

**Setup Version:** 1.0.0  
**Last Updated:** 2025-10-09  
**Status:** ✅ Ready for Installation
