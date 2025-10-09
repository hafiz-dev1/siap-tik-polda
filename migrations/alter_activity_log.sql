-- Migration: Update Activity Log table to add missing columns
-- Execute this with: npx tsx run-migration-alter.ts

-- Step 1: Add missing columns to activity_log
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS "entityType" TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS "entityId" TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'SUCCESS';

-- Step 2: Create enums for category (we'll use TEXT for now to avoid enum conflicts)
-- Update existing records to have default values
UPDATE activity_log SET category = 'SYSTEM' WHERE category IS NULL;
UPDATE activity_log SET type = 'OTHER' WHERE type IS NULL;
UPDATE activity_log SET status = 'SUCCESS' WHERE status IS NULL;

-- Step 3: Make columns NOT NULL after setting defaults
ALTER TABLE activity_log ALTER COLUMN category SET NOT NULL;
ALTER TABLE activity_log ALTER COLUMN type SET NOT NULL;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS "activity_log_category_idx" ON activity_log(category);
CREATE INDEX IF NOT EXISTS "activity_log_type_idx" ON activity_log(type);
CREATE INDEX IF NOT EXISTS "activity_log_entityType_idx" ON activity_log("entityType");
CREATE INDEX IF NOT EXISTS "activity_log_status_idx" ON activity_log(status);
