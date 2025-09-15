// file: prisma/seed.ts

import { PrismaClient, Role } from '@prisma/client'; // Impor Role
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding...');

  const username = 'admin';
  const plainPassword = 'password123';

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Gunakan upsert untuk membuat atau mengkonfirmasi data admin
  const admin = await prisma.pengguna.upsert({
    where: { username: username },
    update: {}, // Jika sudah ada, jangan lakukan apa-apa
    create: {
      username: username,
      password: hashedPassword,
      nama: 'Administrator Utama', // <-- Tambahkan nama
      role: Role.ADMIN,             // <-- Tetapkan peran sebagai ADMIN
    },
  });

  console.log(`Akun admin ${admin.username} berhasil dibuat/dikonfirmasi.`);
  console.log('Seeding selesai.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });