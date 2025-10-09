// Script untuk membuat akun SUPER_ADMIN baru
// Username: superadmin
// Password: admin123

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('🔐 Membuat Akun SUPER_ADMIN\n');

    // Kredensial
    const username = 'superadmin';
    const password = 'admin123';
    const nama = 'Super Administrator';
    const nrp_nip = 'SUPERADMIN001';

    // Cek apakah username sudah ada
    const existingUser = await prisma.pengguna.findFirst({
      where: { 
        username: username 
      },
    });

    if (existingUser) {
      console.log('⚠️  User dengan username "superadmin" sudah ada!\n');
      console.log('📋 Info User yang Ada:');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Username: ${existingUser.username}`);
      console.log(`   Nama: ${existingUser.nama}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log(`   Status: ${existingUser.deletedAt ? 'Terhapus (Soft Delete)' : 'Aktif'}\n`);

      if (existingUser.deletedAt) {
        console.log('🔄 User ini sudah ada tapi terhapus (soft delete).');
        console.log('   Mengaktifkan kembali dan reset password...\n');

        // Restore dan update
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.pengguna.update({
          where: { id: existingUser.id },
          data: { 
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            nama: nama,
            nrp_nip: nrp_nip,
            deletedAt: null // Restore
          },
        });

        console.log('✅ User berhasil diaktifkan kembali dan password di-reset!\n');
      } else {
        console.log('🔄 Reset password untuk user yang sudah ada...\n');
        
        // Update password saja
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.pengguna.update({
          where: { id: existingUser.id },
          data: { 
            password: hashedPassword,
            role: 'SUPER_ADMIN', // Pastikan rolenya SUPER_ADMIN
          },
        });

        console.log('✅ Password berhasil di-reset!\n');
      }

      console.log('📝 Kredensial Login:');
      console.log(`   Username: ${username}`);
      console.log(`   Password: ${password}`);
      console.log(`   Role: SUPER_ADMIN\n`);
      
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const newSuperAdmin = await prisma.pengguna.create({
      data: {
        username: username,
        password: hashedPassword,
        nama: nama,
        nrp_nip: nrp_nip,
        role: 'SUPER_ADMIN',
      },
    });

    console.log('✅ Akun SUPER_ADMIN berhasil dibuat!\n');
    console.log('📋 Detail Akun:');
    console.log(`   ID: ${newSuperAdmin.id}`);
    console.log(`   Username: ${newSuperAdmin.username}`);
    console.log(`   Nama: ${newSuperAdmin.nama}`);
    console.log(`   NRP/NIP: ${newSuperAdmin.nrp_nip}`);
    console.log(`   Role: ${newSuperAdmin.role}`);
    console.log(`   Created: ${newSuperAdmin.createdAt}\n`);

    console.log('📝 Kredensial Login:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: SUPER_ADMIN\n`);

    console.log('⚠️  PENTING:');
    console.log('   - Segera ganti password setelah login pertama kali!');
    console.log('   - Jangan share kredensial ini ke orang lain.');
    console.log('   - Simpan password di tempat yang aman.\n');

  } catch (error) {
    console.error('❌ Error saat membuat SUPER_ADMIN:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        console.log('\n💡 Tip: Username sudah digunakan. Gunakan username lain atau hapus user yang ada terlebih dahulu.\n');
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Jalankan fungsi
createSuperAdmin()
  .then(() => {
    console.log('🎉 Selesai!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal Error:', error);
    process.exit(1);
  });
