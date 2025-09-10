// file: prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Inisialisasi Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding...');

  // 1. Tentukan kredensial untuk admin pertama
  const username = 'admin';
  const plainPassword = 'password123'; // Ganti dengan password yang kuat untuk produksi

  // 2. Hash password sebelum disimpan
  // Angka 10 adalah "salt round", yaitu tingkat kompleksitas hash. 10 adalah standar yang baik.
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // 3. Buat data operator di dalam database
  // `upsert` akan membuat data jika belum ada, atau memperbarui jika sudah ada (berdasarkan `username`)
  // Ini mencegah error jika script dijalankan lebih dari sekali.
  const admin = await prisma.operator.upsert({
    where: { username: username },
    update: {}, // Jika sudah ada, jangan lakukan apa-apa
    create: {
      username: username,
      password: hashedPassword,
    },
  });

  console.log(`Akun admin ${admin.username} berhasil dibuat/dikonfirmasi.`);
  console.log('Seeding selesai.');
}

// Jalankan fungsi main dan tangani error/sukses
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Selalu tutup koneksi database setelah selesai
    await prisma.$disconnect();
  });