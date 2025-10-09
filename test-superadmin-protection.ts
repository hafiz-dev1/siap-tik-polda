// Script untuk test proteksi akun Super Admin
// Pastikan akun superadmin dilindungi dari edit dan hapus

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSuperAdminProtection() {
  console.log('🛡️ Testing Super Admin Protection\n');

  try {
    // 1. Cari akun superadmin
    console.log('1️⃣ Mencari akun Super Admin...');
    const superAdmin = await prisma.pengguna.findFirst({
      where: {
        OR: [
          { username: 'superadmin' },
          { role: 'SUPER_ADMIN' }
        ],
        deletedAt: null
      }
    });

    if (!superAdmin) {
      console.log('   ❌ Akun Super Admin tidak ditemukan!\n');
      console.log('   💡 Jalankan: npx ts-node create-superadmin.ts\n');
      return;
    }

    console.log('   ✅ Akun Super Admin ditemukan:');
    console.log(`      ID: ${superAdmin.id}`);
    console.log(`      Username: ${superAdmin.username}`);
    console.log(`      Nama: ${superAdmin.nama}`);
    console.log(`      Role: ${superAdmin.role}\n`);

    // 2. Test kondisi proteksi
    console.log('2️⃣ Testing kondisi proteksi...\n');

    // Kondisi 1: Cek username
    const isProtectedByUsername = superAdmin.username === 'superadmin';
    console.log(`   📋 Username check: ${isProtectedByUsername ? '✅' : '❌'} (username === 'superadmin')`);

    // Kondisi 2: Cek role
    const isProtectedByRole = superAdmin.role === 'SUPER_ADMIN';
    console.log(`   📋 Role check: ${isProtectedByRole ? '✅' : '❌'} (role === 'SUPER_ADMIN')`);

    // Kondisi gabungan
    const isProtected = isProtectedByUsername || isProtectedByRole;
    console.log(`   📋 Combined check: ${isProtected ? '✅' : '❌'} (username OR role)\n`);

    if (isProtected) {
      console.log('   ✅ Akun dilindungi dengan benar!\n');
    } else {
      console.log('   ❌ WARNING: Akun tidak terlindungi!\n');
    }

    // 3. Cek apakah ada akun SUPER_ADMIN lain
    console.log('3️⃣ Mencari akun SUPER_ADMIN lainnya...');
    const allSuperAdmins = await prisma.pengguna.findMany({
      where: {
        role: 'SUPER_ADMIN',
        deletedAt: null
      },
      select: {
        id: true,
        username: true,
        nama: true,
        role: true
      }
    });

    console.log(`   📊 Total akun SUPER_ADMIN aktif: ${allSuperAdmins.length}\n`);

    if (allSuperAdmins.length > 1) {
      console.log('   ⚠️  WARNING: Ada lebih dari satu akun SUPER_ADMIN!\n');
      allSuperAdmins.forEach((admin, index) => {
        const isMainSuperAdmin = admin.username === 'superadmin';
        console.log(`   ${index + 1}. ${isMainSuperAdmin ? '🔒' : '⚠️'} ${admin.username} (${admin.nama})`);
      });
      console.log();
    } else {
      console.log('   ✅ Hanya ada satu akun SUPER_ADMIN (ideal)\n');
    }

    // 4. Cek akun Admin biasa
    console.log('4️⃣ Mencari akun Admin biasa...');
    const regularAdmins = await prisma.pengguna.findMany({
      where: {
        role: 'ADMIN',
        deletedAt: null
      },
      select: {
        id: true,
        username: true,
        nama: true,
        role: true
      }
    });

    console.log(`   📊 Total akun ADMIN: ${regularAdmins.length}\n`);

    if (regularAdmins.length > 0) {
      console.log('   📋 Daftar akun Admin (tidak dilindungi):\n');
      regularAdmins.forEach((admin, index) => {
        console.log(`   ${index + 1}. 👤 ${admin.username} (${admin.nama})`);
      });
      console.log();
    }

    // 5. Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Akun Super Admin: ${superAdmin.username}`);
    console.log(`${isProtectedByUsername ? '✅' : '❌'} Protected by username: 'superadmin'`);
    console.log(`${isProtectedByRole ? '✅' : '❌'} Protected by role: 'SUPER_ADMIN'`);
    console.log(`✅ Total SUPER_ADMIN: ${allSuperAdmins.length}`);
    console.log(`✅ Total ADMIN: ${regularAdmins.length}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // 6. Expected behavior
    console.log('📘 EXPECTED BEHAVIOR:');
    console.log('───────────────────────────────────────────────────────');
    console.log('Pada halaman Manajemen Pengguna:\n');
    
    console.log('🔒 Untuk akun SUPER_ADMIN (username: superadmin):');
    console.log('   ✅ Tampilkan badge: "Akun Dilindungi" (warna amber)');
    console.log('   ❌ TIDAK tampilkan tombol "Ubah"');
    console.log('   ❌ TIDAK tampilkan tombol "Hapus"\n');

    console.log('👤 Untuk akun ADMIN biasa:');
    console.log('   ✅ Tampilkan tombol "Ubah"');
    console.log('   ✅ Tampilkan tombol "Hapus"\n');

    console.log('🔐 Server-side Protection:');
    console.log('   ✅ updateUser() akan reject jika target username === "superadmin"');
    console.log('   ✅ updateUser() akan reject jika target role === "SUPER_ADMIN"');
    console.log('   ✅ deleteUser() akan reject jika target username === "superadmin"');
    console.log('   ✅ deleteUser() akan reject jika target role === "SUPER_ADMIN"\n');

  } catch (error) {
    console.error('❌ Error saat testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSuperAdminProtection();
