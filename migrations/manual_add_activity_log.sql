-- Migration: Add Activity Log Feature
-- Description: Menambahkan tabel activity_log dan enum yang diperlukan

-- Step 1: Drop existing activity_log table jika ada (backup data dulu jika penting!)
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

-- Step 6: Add activityLogs relation to pengguna table (already handled by Prisma)
-- No SQL needed, Prisma will handle the relation

-- Verification queries:
-- SELECT * FROM activity_log LIMIT 10;
-- SELECT COUNT(*) FROM activity_log;
-- \d activity_log

COMMENT ON TABLE activity_log IS 'Tabel untuk menyimpan log aktivitas pengguna';
COMMENT ON COLUMN activity_log.category IS 'Kategori aktivitas (AUTH, SURAT, USER, PROFILE, TRASH, SYSTEM)';
COMMENT ON COLUMN activity_log.type IS 'Tipe aktivitas (CREATE, UPDATE, DELETE, dll)';
COMMENT ON COLUMN activity_log.description IS 'Deskripsi detail aktivitas';
COMMENT ON COLUMN activity_log.metadata IS 'Data tambahan dalam format JSON';
COMMENT ON COLUMN activity_log.status IS 'Status aktivitas (SUCCESS, FAILED, WARNING)';
