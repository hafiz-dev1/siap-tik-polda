# 🚀 EXECUTE THIS - Database Migration Instructions

> **IMPORTANT:** Eksekusi file ini untuk mengaktifkan fitur Log Activity

---

## ⚠️ BEFORE YOU START

### Prerequisites Checklist
- [ ] Backup database sudah dibuat
- [ ] Koneksi database verified (dapat akses ke database)
- [ ] Punya akses admin database (CREATE TABLE permission)
- [ ] Development server tidak sedang berjalan (stop `npm run dev`)

---

## 📋 OPTION 1: Execute via Prisma Studio (RECOMMENDED)

### Step 1: Open Prisma Studio
```powershell
npx prisma studio
```

### Step 2: Execute Raw SQL
1. Klik tab "Query" atau "SQL Editor" (jika tersedia)
2. Jika tidak ada, lanjut ke Option 2

---

## 📋 OPTION 2: Execute via psql (PostgreSQL CLI)

### Step 1: Connect to Database
```powershell
# Get database URL from .env file
# Replace with your actual connection string
psql "postgresql://user:password@host:port/database"
```

### Step 2: Execute Migration File
```sql
\i migrations/manual_add_activity_log.sql
```

atau copy-paste seluruh isi file:

```sql
-- Migration: Add Activity Log Feature

-- Step 1: Drop existing activity_log table if exists
DROP TABLE IF EXISTS activity_log CASCADE;

-- Step 2: Create enum ActivityCategory
DO $$ BEGIN
    CREATE TYPE "ActivityCategory" AS ENUM ('AUTH', 'SURAT', 'USER', 'PROFILE', 'TRASH', 'SYSTEM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 3: Create enum ActivityType
DO $$ BEGIN
    CREATE TYPE "ActivityType" AS ENUM (
        'LOGIN',
        'LOGOUT',
        'CREATE',
        'UPDATE',
        'DELETE',
        'RESTORE',
        'PERMANENT_DELETE',
        'BULK_DELETE',
        'BULK_RESTORE',
        'BULK_PERMANENT_DELETE',
        'VIEW',
        'DOWNLOAD',
        'UPLOAD',
        'PASSWORD_CHANGE',
        'PROFILE_UPDATE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 4: Create activity_log table
CREATE TABLE activity_log (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    category "ActivityCategory" NOT NULL,
    type "ActivityType" NOT NULL,
    description TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    metadata JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    status TEXT NOT NULL DEFAULT 'SUCCESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "activity_log_userId_fkey" FOREIGN KEY ("userId") 
        REFERENCES pengguna(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Step 5: Create indexes for performance
CREATE INDEX "activity_log_userId_idx" ON activity_log("userId");
CREATE INDEX "activity_log_category_idx" ON activity_log(category);
CREATE INDEX "activity_log_type_idx" ON activity_log(type);
CREATE INDEX "activity_log_createdAt_idx" ON activity_log("createdAt");
CREATE INDEX "activity_log_userId_createdAt_idx" ON activity_log("userId", "createdAt");

-- Comments
COMMENT ON TABLE activity_log IS 'Tabel untuk menyimpan log aktivitas pengguna';
COMMENT ON COLUMN activity_log.category IS 'Kategori aktivitas (AUTH, SURAT, USER, PROFILE, TRASH, SYSTEM)';
COMMENT ON COLUMN activity_log.type IS 'Tipe aktivitas (CREATE, UPDATE, DELETE, dll)';
COMMENT ON COLUMN activity_log.description IS 'Deskripsi detail aktivitas';
COMMENT ON COLUMN activity_log.metadata IS 'Data tambahan dalam format JSON';
COMMENT ON COLUMN activity_log.status IS 'Status aktivitas (SUCCESS, FAILED, WARNING)';
```

### Step 3: Verify Migration
```sql
-- Check table exists
\d activity_log

-- Check enums
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ActivityCategory');

SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ActivityType');

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'activity_log';
```

Expected output:
```
Table: activity_log exists ✓
Enums: ActivityCategory (6 values) ✓
Enums: ActivityType (15 values) ✓
Indexes: 5 indexes created ✓
```

---

## 📋 OPTION 3: Execute via pgAdmin

### Step 1: Open pgAdmin
1. Open pgAdmin application
2. Connect to your database server
3. Navigate to your database

### Step 2: Open Query Tool
1. Right-click on your database
2. Select "Query Tool"

### Step 3: Load SQL File
1. Click "Open File" icon
2. Select `migrations/manual_add_activity_log.sql`
3. Click "Execute" (F5)

### Step 4: Verify
Check "Messages" tab for success confirmation

---

## 📋 OPTION 4: Execute via DB Management Tool

Jika Anda menggunakan tool lain (DBeaver, DataGrip, etc.):
1. Open SQL editor
2. Load file `migrations/manual_add_activity_log.sql`
3. Execute
4. Verify table created

---

## ✅ POST-MIGRATION STEPS

### Step 1: Generate Prisma Client
```powershell
npx prisma generate
```

Expected output:
```
✔ Generated Prisma Client to .\node_modules\@prisma\client
```

### Step 2: Verify in Code
```powershell
# Start development server
npm run dev
```

### Step 3: Test Application
1. Open browser: http://localhost:3000
2. Login dengan user yang ada
3. Klik profile dropdown
4. Verify "Log Aktivitas" menu muncul
5. Klik "Log Aktivitas"
6. Halaman log activity harus terbuka tanpa error

### Step 4: Verify Logging Works
1. Logout
2. Login lagi
3. Go to Log Activity page
4. Verify login log tercatat

---

## 🔍 VERIFICATION QUERIES

### Check Table Structure
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'activity_log'
ORDER BY ordinal_position;
```

### Check Foreign Key
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
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'activity_log'
  AND tc.constraint_type = 'FOREIGN KEY';
```

### Test Insert (Manual)
```sql
-- Get a valid user ID first
SELECT id, username FROM pengguna LIMIT 1;

-- Insert test log (replace USER_ID with actual ID from above)
INSERT INTO activity_log (id, "userId", category, type, description)
VALUES (gen_random_uuid()::text, 'USER_ID_HERE', 'SYSTEM', 'CREATE', 'Test log');

-- Verify insert
SELECT * FROM activity_log ORDER BY "createdAt" DESC LIMIT 1;

-- Delete test log
DELETE FROM activity_log WHERE description = 'Test log';
```

---

## ⚠️ TROUBLESHOOTING

### Error: "type ActivityCategory already exists"
**Solution:**
```sql
-- Check if enum exists
SELECT * FROM pg_type WHERE typname = 'ActivityCategory';

-- If exists and has wrong values, drop and recreate
DROP TYPE IF EXISTS "ActivityCategory" CASCADE;
DROP TYPE IF EXISTS "ActivityType" CASCADE;

-- Then run migration again
```

### Error: "table activity_log already exists"
**Solution:**
```sql
-- Drop existing table
DROP TABLE IF EXISTS activity_log CASCADE;

-- Run migration again
```

### Error: "permission denied"
**Solution:**
- Pastikan user database Anda punya permission CREATE TABLE
- Atau gunakan superuser account

### Error: "cannot connect to database"
**Solution:**
- Check DATABASE_URL di `.env`
- Verify database server running
- Check network connectivity

---

## 🎯 SUCCESS CRITERIA

Migration berhasil jika:
- [ ] Table `activity_log` created
- [ ] Enum `ActivityCategory` created (6 values)
- [ ] Enum `ActivityType` created (15 values)
- [ ] 5 indexes created
- [ ] Foreign key to `pengguna` exists
- [ ] `npx prisma generate` runs without error
- [ ] Application starts without error
- [ ] Log Activity menu appears in dropdown
- [ ] Log Activity page loads successfully
- [ ] Login creates log in database

---

## 📞 NEED HELP?

### If Migration Fails
1. Check error message carefully
2. Review troubleshooting section above
3. Verify database connection
4. Check user permissions
5. Try dropping and recreating

### If Everything Looks Good But Not Working
1. Run `npx prisma generate` again
2. Restart development server
3. Clear browser cache
4. Check browser console for errors
5. Check server terminal for errors

### If Still Having Issues
1. Review `SETUP_LOG_ACTIVITY.md`
2. Check `LOG_ACTIVITY_DOCUMENTATION.md`
3. Verify all files are in place
4. Check TypeScript compilation

---

## 🎊 AFTER SUCCESSFUL MIGRATION

Next steps:
1. ✅ Read `LOG_ACTIVITY_README.md` for usage guide
2. ✅ Test all features (login, create surat, filters, export)
3. ✅ Review `HOW_TO_ADD_LOGGING.md` to add more tracking
4. ✅ Use `LOG_ACTIVITY_FINAL_CHECKLIST.md` before deployment
5. ✅ Train team on how to use the feature

---

**File Location:** `migrations/manual_add_activity_log.sql`  
**Execute Time:** ~1-2 minutes  
**Rollback:** Drop table and enums if needed  
**Status:** Ready to execute

---

## 🚀 QUICK EXECUTE COMMAND

```powershell
# Option A: Via psql
psql $env:DATABASE_URL -f migrations/manual_add_activity_log.sql

# Option B: Via Prisma (db push)
npx prisma db push

# Then generate client
npx prisma generate

# Then test
npm run dev
```

---

**READY TO EXECUTE!** 🎉

Pilih salah satu option di atas dan execute migration. Good luck! 🚀
