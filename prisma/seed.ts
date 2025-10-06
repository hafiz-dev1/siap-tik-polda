// file: prisma/seed.ts

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding...');

  const defaultAccounts = [
    {
      username: 'superadmin',
      plainPassword: 'superadmin123',
      nama: 'Super Administrator',
      role: Role.SUPER_ADMIN,
    },
    {
      username: 'admin',
      plainPassword: 'admin123',
      nama: 'Administrator Utama',
      role: Role.ADMIN,
    },
  ];

  for (const account of defaultAccounts) {
    const hashedPassword = await bcrypt.hash(account.plainPassword, 10);

    const pengguna = await prisma.pengguna.upsert({
      where: { username: account.username },
      update: {
        nama: account.nama,
        role: account.role,
      },
      create: {
        username: account.username,
        password: hashedPassword,
        nama: account.nama,
        role: account.role,
      },
    });

    console.log(
      `Akun ${pengguna.role === Role.SUPER_ADMIN ? 'super admin' : 'admin'} ${pengguna.username} berhasil dibuat/dikonfirmasi.`,
    );
  }

  const extraSuperAdmins = await prisma.pengguna.findMany({
    where: {
      role: Role.SUPER_ADMIN,
      username: { not: 'superadmin' },
    },
    select: { id: true, username: true },
  });

  if (extraSuperAdmins.length > 0) {
    console.warn(
      'Menurunkan peran super admin berlebih menjadi admin:',
      extraSuperAdmins.map((u) => u.username),
    );

    await prisma.pengguna.updateMany({
      where: { id: { in: extraSuperAdmins.map((u) => u.id) } },
      data: { role: Role.ADMIN },
    });
  }

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