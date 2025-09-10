-- CreateEnum
CREATE TYPE "public"."ArahSurat" AS ENUM ('MASUK', 'KELUAR');

-- CreateEnum
CREATE TYPE "public"."TipeDokumen" AS ENUM ('NOTA_DINAS', 'SURAT_BIASA', 'SPRIN', 'TELEGRAM');

-- CreateEnum
CREATE TYPE "public"."TujuanDisposisi" AS ENUM ('KASUBBID_TEKKOM', 'KASUBBID_TEKINFO', 'KASUBBAG_RENMIN', 'KAUR_KEU');

-- CreateTable
CREATE TABLE "public"."operator" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."surat" (
    "id" TEXT NOT NULL,
    "nomor_surat" TEXT NOT NULL,
    "tanggal_surat" TIMESTAMP(3) NOT NULL,
    "perihal" TEXT NOT NULL,
    "asal_surat" TEXT NOT NULL,
    "tujuan_surat" TEXT NOT NULL,
    "arah_surat" "public"."ArahSurat" NOT NULL,
    "tipe_dokumen" "public"."TipeDokumen" NOT NULL,
    "tujuan_disposisi" "public"."TujuanDisposisi" NOT NULL,
    "isi_disposisi" TEXT NOT NULL,
    "id_operator" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "surat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lampiran" (
    "id" TEXT NOT NULL,
    "nama_file" TEXT NOT NULL,
    "path_file" TEXT NOT NULL,
    "tipe_file" TEXT NOT NULL,
    "ukuran_file" INTEGER NOT NULL,
    "id_surat" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lampiran_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "operator_username_key" ON "public"."operator"("username");

-- CreateIndex
CREATE UNIQUE INDEX "surat_nomor_surat_key" ON "public"."surat"("nomor_surat");

-- AddForeignKey
ALTER TABLE "public"."surat" ADD CONSTRAINT "surat_id_operator_fkey" FOREIGN KEY ("id_operator") REFERENCES "public"."operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lampiran" ADD CONSTRAINT "lampiran_id_surat_fkey" FOREIGN KEY ("id_surat") REFERENCES "public"."surat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
