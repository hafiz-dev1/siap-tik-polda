-- Rename existing enum values to introduce SUPER_ADMIN while preserving data
ALTER TABLE "pengguna" ALTER COLUMN "role" DROP DEFAULT;

ALTER TYPE "Role" RENAME VALUE 'ADMIN' TO 'SUPER_ADMIN';
ALTER TYPE "Role" RENAME VALUE 'USER' TO 'ADMIN';

ALTER TABLE "pengguna" ALTER COLUMN "role" SET DEFAULT 'ADMIN';
