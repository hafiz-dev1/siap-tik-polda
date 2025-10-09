// Script untuk reset password SUPER_ADMIN
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetSuperAdminPassword() {
  try {
    console.log('🔑 Reset Password SUPER_ADMIN\n');

    // Cari akun SUPER_ADMIN yang aktif
    const superAdmin = await prisma.pengguna.findFirst({
      where: { 
        role: 'SUPER_ADMIN',
        deletedAt: null 
      },
    });

    if (!superAdmin) {
      console.log('❌ Akun SUPER_ADMIN tidak ditemukan atau tidak aktif.');
      return;
    }

    console.log('📋 Info Akun SUPER_ADMIN:');
    console.log(`   Username: ${superAdmin.username}`);
    console.log(`   Nama: ${superAdmin.nama}\n`);

    // Password baru - GANTI SESUAI KEBUTUHAN
    const newPassword = 'admin123'; // Ganti dengan password yang diinginkan
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.pengguna.update({
      where: { id: superAdmin.id },
      data: { 
        password: hashedPassword,
        deletedAt: null // Pastikan tidak soft-deleted
      },
    });

    console.log('✅ Password berhasil direset!');
    console.log('\n📝 Detail Login:');
    console.log(`   Username: ${superAdmin.username}`);
    console.log(`   Password: ${newPassword}`);
    console.log('\n⚠️  PENTING: Segera ganti password setelah login!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetSuperAdminPassword();
