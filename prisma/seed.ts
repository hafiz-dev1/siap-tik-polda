// file: prisma/seed.ts

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type SeedPenggunaConfig = {
  identifier: string;
  role: Role;
  defaultValues: {
    username: string;
    nama: string;
    plainPassword: string;
    nrp_nip?: string | null;
    profilePictureUrl?: string | null;
  };
  envKeys?: {
    username?: string;
    nama?: string;
    password?: string;
    nrp_nip?: string;
    profilePictureUrl?: string;
  };
};

type SeedPengguna = {
  identifier: string;
  username: string;
  nama: string;
  plainPassword: string;
  nrp_nip?: string | null;
  profilePictureUrl?: string | null;
  role: Role;
};

const SEED_PENGGUNA_PRESETS: SeedPenggunaConfig[] = [
  {
    identifier: 'SUPER_ADMIN_AKTIF',
    role: Role.SUPER_ADMIN,
    defaultValues: {
      username: 'superadmin',
      nama: 'Super Administrator',
      plainPassword: 'SuperAdmin!123',
      nrp_nip: '11111111 111111 1 111',
    },
    envKeys: {
      username: 'SEED_SUPERADMIN_USERNAME',
      nama: 'SEED_SUPERADMIN_NAMA',
      password: 'SEED_SUPERADMIN_PASSWORD',
      nrp_nip: 'SEED_SUPERADMIN_NRP',
      profilePictureUrl: 'SEED_SUPERADMIN_AVATAR',
    },
  },
  {
    identifier: 'ADMIN_PELAKSANA_1',
    role: Role.ADMIN,
    defaultValues: {
      username: 'admin-bidtik',
      nama: 'Admin Bid TIK Polda',
      plainPassword: 'AdminBidTIK!123',
      nrp_nip: '19750412 200312 1 002',
    },
    envKeys: {
      username: 'SEED_ADMIN1_USERNAME',
      nama: 'SEED_ADMIN1_NAMA',
      password: 'SEED_ADMIN1_PASSWORD',
      nrp_nip: 'SEED_ADMIN1_NRP',
      profilePictureUrl: 'SEED_ADMIN1_AVATAR',
    },
  },
  {
    identifier: 'ADMIN_TEKOM',
    role: Role.ADMIN,
    defaultValues: {
      username: 'admin-tekkom',
      nama: 'Admin Subbid Tekkom',
      plainPassword: 'TekkomAdmin!123',
      nrp_nip: '19801104 200112 1 003',
    },
    envKeys: {
      username: 'SEED_ADMIN2_USERNAME',
      nama: 'SEED_ADMIN2_NAMA',
      password: 'SEED_ADMIN2_PASSWORD',
      nrp_nip: 'SEED_ADMIN2_NRP',
      profilePictureUrl: 'SEED_ADMIN2_AVATAR',
    },
  },
  {
    identifier: 'ADMIN_TEKINFO',
    role: Role.ADMIN,
    defaultValues: {
      username: 'admin-tekinfo',
      nama: 'Admin Subbid Tekinfo',
      plainPassword: 'TekinfoAdmin!123',
      nrp_nip: '19841218 200712 1 004',
    },
    envKeys: {
      username: 'SEED_ADMIN3_USERNAME',
      nama: 'SEED_ADMIN3_NAMA',
      password: 'SEED_ADMIN3_PASSWORD',
      nrp_nip: 'SEED_ADMIN3_NRP',
      profilePictureUrl: 'SEED_ADMIN3_AVATAR',
    },
  },
];

function resolveEnvValue(key: string | undefined, fallback: string | null | undefined) {
  if (!key) return fallback?.trim() ? fallback : undefined;
  const val = process.env[key];
  if (typeof val !== 'string') return fallback?.trim() ? fallback : undefined;
  const trimmed = val.trim();
  if (!trimmed) return fallback?.trim() ? fallback : undefined;
  return trimmed;
}

function hydrateSeedPengguna(config: SeedPenggunaConfig): SeedPengguna {
  const username = resolveEnvValue(config.envKeys?.username, config.defaultValues.username);
  const nama = resolveEnvValue(config.envKeys?.nama, config.defaultValues.nama);
  const plainPassword = resolveEnvValue(config.envKeys?.password, config.defaultValues.plainPassword);
  const nrp_nip = resolveEnvValue(config.envKeys?.nrp_nip, config.defaultValues.nrp_nip ?? undefined);
  const profilePictureUrl = resolveEnvValue(
    config.envKeys?.profilePictureUrl,
    config.defaultValues.profilePictureUrl ?? undefined,
  );

  if (!username) {
    throw new Error(`Konfigurasi seed pengguna "${config.identifier}" tidak memiliki username.`);
  }
  if (!plainPassword) {
    throw new Error(`Konfigurasi seed pengguna "${config.identifier}" tidak memiliki password.`);
  }
  if (!nama) {
    throw new Error(`Konfigurasi seed pengguna "${config.identifier}" tidak memiliki nama.`);
  }

  return {
    identifier: config.identifier,
    username,
    nama,
    plainPassword,
    nrp_nip: nrp_nip ?? null,
    profilePictureUrl: profilePictureUrl ?? null,
    role: config.role,
  };
}

function detectDuplicateUsernames(seedUsers: SeedPengguna[]) {
  const seen = new Map<string, SeedPengguna[]>();
  seedUsers.forEach((user) => {
    seen.set(user.username, [...(seen.get(user.username) ?? []), user]);
  });
  const duplicates = [...seen.entries()].filter(([, users]) => users.length > 1);
  if (duplicates.length > 0) {
    const message = duplicates
      .map(([username, users]) => `- ${username}: ${users.map((u) => u.identifier).join(', ')}`)
      .join('\n');
    throw new Error(`Duplicate username terdeteksi pada konfigurasi seed:\n${message}`);
  }
}

async function upsertPengguna(seedUser: SeedPengguna) {
  const hashedPassword = await bcrypt.hash(seedUser.plainPassword, 10);

  const pengguna = await prisma.pengguna.upsert({
    where: { username: seedUser.username },
    update: {
      nama: seedUser.nama,
      role: seedUser.role,
      nrp_nip: seedUser.nrp_nip,
      profilePictureUrl: seedUser.profilePictureUrl,
      deletedAt: null,
    },
    create: {
      username: seedUser.username,
      password: hashedPassword,
      nama: seedUser.nama,
      role: seedUser.role,
      nrp_nip: seedUser.nrp_nip,
      profilePictureUrl: seedUser.profilePictureUrl,
    },
  });

  console.log(
    `✔️ ${seedUser.identifier} (${seedUser.role}) → ${pengguna.username} berhasil dibuat/diperbarui.`,
  );
}

async function enforceSuperAdminSingularity(allowedUsernames: string[]) {
  const extraSuperAdmins = await prisma.pengguna.findMany({
    where: {
      role: Role.SUPER_ADMIN,
      username: { notIn: allowedUsernames },
    },
    select: { id: true, username: true },
  });

  if (extraSuperAdmins.length === 0) {
    return;
  }

  console.warn(
    '⚠️ Menurunkan peran super admin yang tidak terdaftar pada konfigurasi seed menjadi ADMIN:',
    extraSuperAdmins.map((u) => u.username).join(', '),
  );

  await prisma.pengguna.updateMany({
    where: { id: { in: extraSuperAdmins.map((u) => u.id) } },
    data: { role: Role.ADMIN },
  });
}

async function main() {
  console.log('🚀 Memulai proses seeding Pengguna...');

  const seedUsers = SEED_PENGGUNA_PRESETS.map(hydrateSeedPengguna);
  detectDuplicateUsernames(seedUsers);

  for (const seedUser of seedUsers) {
    await upsertPengguna(seedUser);
  }

  const allowedSuperAdminUsernames = seedUsers
    .filter((user) => user.role === Role.SUPER_ADMIN)
    .map((user) => user.username);

  await enforceSuperAdminSingularity(allowedSuperAdminUsernames);

  console.log('✅ Seeding pengguna selesai.');
  console.log(
    'ℹ️ Pastikan untuk mengganti password default dengan perintah ubah password pada produksi.',
  );
}

main()
  .catch((e) => {
    console.error('❌ Seeding pengguna gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });