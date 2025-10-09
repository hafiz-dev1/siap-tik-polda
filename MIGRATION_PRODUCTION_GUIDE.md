# 📋 MIGRATION GUIDE: Activity Log untuk Production

## 🎯 Cara Menjalankan Migration di Database Production

### Opsi 1: Via psql (Command Line) - RECOMMENDED ✅

#### Windows PowerShell:
```powershell
# 1. Set DATABASE_URL (ambil dari Vercel Dashboard)
$env:DATABASE_URL = "postgresql://user:password@host:5432/database?sslmode=require"

# 2. Test connection
psql $env:DATABASE_URL -c "SELECT version();"

# 3. Jalankan migration
psql $env:DATABASE_URL -f migrations/manual_add_activity_log.sql

# 4. Verify
psql $env:DATABASE_URL -c "SELECT COUNT(*) FROM activity_log;"
```

#### Linux/Mac:
```bash
# 1. Set DATABASE_URL (ambil dari Vercel Dashboard)
export DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# 2. Test connection
psql $DATABASE_URL -c "SELECT version();"

# 3. Jalankan migration
psql $DATABASE_URL -f migrations/manual_add_activity_log.sql

# 4. Verify
psql $DATABASE_URL -c "SELECT COUNT(*) FROM activity_log;"
```

---

### Opsi 2: Via Prisma Studio

```bash
# 1. Set DATABASE_URL
$env:DATABASE_URL = "your-production-url"

# 2. Buka Prisma Studio
npx prisma studio

# 3. Di browser, buka console dan jalankan raw query
# Copy-paste isi file migrations/manual_add_activity_log.sql
```

---

### Opsi 3: Via Database GUI (pgAdmin, DBeaver, TablePlus)

```
1. Koneksi ke database production
2. Buka SQL Editor
3. Copy-paste isi file: migrations/manual_add_activity_log.sql
4. Execute
```

---

### Opsi 4: Via Vercel CLI

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Link project
vercel link

# 4. Pull environment variables
vercel env pull

# 5. Sekarang DATABASE_URL ada di .env, jalankan migration
psql $(grep DATABASE_URL .env | cut -d '=' -f2) -f migrations/manual_add_activity_log.sql
```

---

## 🔍 Verify Migration Berhasil

### Check 1: Tabel Exists
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'activity_log';
```

Expected: 1 row (activity_log)

---

### Check 2: Struktur Kolom
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'activity_log'
ORDER BY ordinal_position;
```

Expected columns:
- id (text)
- userId (text)
- category (text)
- type (text)
- description (text)
- entityType (text)
- entityId (text)
- metadata (jsonb)
- ipAddress (text)
- userAgent (text)
- status (text)
- createdAt (timestamp)

---

### Check 3: Indexes
```sql
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'activity_log';
```

Expected indexes:
- activity_log_pkey
- activity_log_userId_idx
- activity_log_category_idx
- activity_log_type_idx
- activity_log_createdAt_idx
- activity_log_userId_createdAt_idx

---

### Check 4: Foreign Key Constraint
```sql
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'activity_log';
```

Expected: 1 constraint (activity_log_userId_fkey → pengguna.id)

---

## 🚨 Troubleshooting Migration

### Error: "relation activity_log already exists"

**Artinya:** Tabel sudah ada tapi struktur mungkin berbeda

**Solusi 1 - Check struktur dulu:**
```sql
\d activity_log
```

**Solusi 2 - Jika struktur salah, recreate:**
```sql
-- HATI-HATI: Ini akan hapus semua data!
DROP TABLE IF EXISTS activity_log CASCADE;

-- Lalu jalankan ulang migration
\i migrations/manual_add_activity_log.sql
```

**Solusi 3 - Alter table (jika hanya butuh tambah kolom):**
```sql
-- Jalankan alter migration
\i migrations/alter_activity_log.sql
```

---

### Error: "type ActivityCategory already exists"

**Artinya:** Enum type sudah ada

**Solusi:**
```sql
-- Drop enum types
DROP TYPE IF EXISTS "ActivityCategory" CASCADE;
DROP TYPE IF EXISTS "ActivityType" CASCADE;

-- Lalu jalankan ulang migration
\i migrations/manual_add_activity_log.sql
```

---

### Error: "permission denied for schema public"

**Artinya:** User DB tidak punya permission

**Solusi:**
```sql
-- Grant permission (jalankan sebagai superuser)
GRANT ALL PRIVILEGES ON SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```

---

### Error: "SSL connection required"

**Solusi:**
```bash
# Tambahkan ?sslmode=require di connection string
psql "postgresql://user:pass@host:5432/db?sslmode=require" -f migrations/manual_add_activity_log.sql
```

---

## ✅ Post-Migration Checklist

After migration berhasil:

### 1. Regenerate Prisma Client
```bash
# Dengan production DATABASE_URL
DATABASE_URL="your-production-url" npx prisma generate
```

### 2. Run Debug Script
```bash
npx tsx debug-log-activity-production.ts
```

Should show:
```
✅ Database connected successfully
✅ Table "activity_log" exists
✅ All required columns present
✅ Can read! Total logs: 0
✅ Can write! Test log created
✅ DIAGNOSIS COMPLETE - All checks passed!
```

### 3. Test Health Check (after deploy)
```bash
curl https://your-app.vercel.app/api/health/activity-log
```

Should return:
```json
{
  "status": "healthy",
  "checks": {
    "tableExists": true,
    "canRead": true,
    "canWrite": true
  }
}
```

### 4. Test di Browser
```
1. Login ke aplikasi
2. Buka /log-activity
3. Should show empty table or existing logs
4. Do some action (login/logout)
5. Refresh → new log should appear
```

---

## 🎓 Understanding the Migration File

File `migrations/manual_add_activity_log.sql` berisi:

1. **Create Enum Types:**
   - ActivityCategory (AUTH, SURAT, USER, PROFILE, TRASH, SYSTEM)
   - ActivityType (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, dll)

2. **Create Table:**
   - activity_log dengan 12 columns

3. **Create Indexes:**
   - 6 indexes untuk performance

4. **Add Foreign Key:**
   - userId references pengguna(id)

5. **Add Comments:**
   - Documentation untuk table & columns

---

## 🔐 Security Notes

1. **Jangan commit DATABASE_URL production ke Git!**
2. **Gunakan environment variables**
3. **Set DATABASE_URL hanya saat migration**
4. **Clear variable setelah selesai:**
   ```bash
   # Windows
   Remove-Item Env:\DATABASE_URL
   
   # Linux/Mac
   unset DATABASE_URL
   ```

---

## 📞 Need Help?

### Check Vercel Database Dashboard:
```
Vercel Dashboard → Storage → Your Database → Browse Data
```

### Check Migration Status:
```bash
npx tsx debug-log-activity-production.ts
```

### Check Prisma Schema Sync:
```bash
npx prisma db pull
npx prisma format
npx prisma validate
```

---

**Ready to run migration?** 🚀  
Follow Step 1 dari opsi yang Anda pilih!
