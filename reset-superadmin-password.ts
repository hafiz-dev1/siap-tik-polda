// Script untuk reset password SUPER_ADMIN
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetSuperAdminPassword() {
  try {
    const newPassword = 'superadmin123';
    console.log('🔄 Generating password hash...');
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('✅ Password hash generated');

    console.log('🔄 Updating SUPER_ADMIN password...');
    
    const result = await prisma.pengguna.updateMany({
      where: { role: 'SUPER_ADMIN' },
      data: { password: hashedPassword },
    });

    if (result.count > 0) {
      console.log('✅ Password SUPER_ADMIN berhasil direset!');
      console.log(`📊 Total akun yang diupdate: ${result.count}`);
      console.log(`🔑 Password baru: ${newPassword}`);
    } else {
      console.log('⚠️  Tidak ada akun SUPER_ADMIN yang ditemukan');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetSuperAdminPassword()
  .then(() => {
    console.log('\n✨ Selesai! Anda sekarang bisa login dengan password baru.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Gagal reset password:', error);
    process.exit(1);
  });
