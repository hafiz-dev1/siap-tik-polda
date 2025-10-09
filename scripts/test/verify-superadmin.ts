// Script untuk verifikasi akun SUPER_ADMIN
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verifySuperAdmin() {
  try {
    console.log('🔍 Verifikasi Akun SUPER_ADMIN\n');

    // Cari user dengan username 'superadmin'
    const user = await prisma.pengguna.findFirst({
      where: { 
        username: 'superadmin' 
      },
    });

    if (!user) {
      console.log('❌ User "superadmin" tidak ditemukan!\n');
      return;
    }

    console.log('✅ User ditemukan!\n');
    console.log('📋 Detail User:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Nama: ${user.nama}`);
    console.log(`   NRP/NIP: ${user.nrp_nip || '-'}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log(`   Updated: ${user.updatedAt}`);
    console.log(`   Status: ${user.deletedAt ? '🔴 Terhapus' : '🟢 Aktif'}\n`);

    // Test password
    const testPassword = 'admin123';
    const isPasswordCorrect = await bcrypt.compare(testPassword, user.password);

    console.log('🔐 Test Password:');
    console.log(`   Password yang dicoba: ${testPassword}`);
    console.log(`   Status: ${isPasswordCorrect ? '✅ BENAR' : '❌ SALAH'}\n`);

    if (isPasswordCorrect) {
      console.log('✅ Verifikasi berhasil! Akun siap digunakan.\n');
      console.log('📝 Kredensial Login:');
      console.log(`   Username: ${user.username}`);
      console.log(`   Password: ${testPassword}`);
      console.log(`   URL Login: http://localhost:3000/login\n`);
    } else {
      console.log('⚠️  Password tidak sesuai!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan
verifySuperAdmin()
  .then(() => {
    console.log('🎉 Verifikasi selesai!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error:', error);
    process.exit(1);
  });
