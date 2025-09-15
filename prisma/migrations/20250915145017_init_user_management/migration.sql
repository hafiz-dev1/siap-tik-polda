/*
  Warnings:

  - You are about to drop the `operator` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'USER');

-- DropForeignKey
ALTER TABLE "public"."surat" DROP CONSTRAINT "surat_id_operator_fkey";

-- DropTable
DROP TABLE "public"."operator";

-- CreateTable
CREATE TABLE "public"."pengguna" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "profilePictureUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_username_key" ON "public"."pengguna"("username");

-- AddForeignKey
ALTER TABLE "public"."surat" ADD CONSTRAINT "surat_id_operator_fkey" FOREIGN KEY ("id_operator") REFERENCES "public"."pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
