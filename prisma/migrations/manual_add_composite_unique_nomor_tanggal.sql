-- CreateIndex: Add composite unique constraint for nomor_surat + tanggal_surat
-- Migration: add_composite_unique_nomor_tanggal
-- Date: 2025-10-08

-- This migration was applied using 'prisma db push' due to shadow database issues
-- The change adds a composite unique constraint on the combination of nomor_surat and tanggal_surat

-- Drop the existing unique constraint on nomor_surat (if it exists)
-- Note: This was already applied via db push
ALTER TABLE "surat" DROP CONSTRAINT IF EXISTS "surat_nomor_surat_key";

-- Add the composite unique constraint
-- Note: This was already applied via db push
CREATE UNIQUE INDEX IF NOT EXISTS "surat_nomor_surat_tanggal_surat_key" 
ON "surat"("nomor_surat", "tanggal_surat");

-- Alternative syntax (Prisma uses this internally):
-- ALTER TABLE "surat" ADD CONSTRAINT "unique_nomor_tanggal" UNIQUE ("nomor_surat", "tanggal_surat");
