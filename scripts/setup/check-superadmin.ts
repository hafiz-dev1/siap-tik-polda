// Script untuk memeriksa dan memperbaiki akun SUPER_ADMIN
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAndFixSuperAdmin() {
  try {
    console.log('🔍 Memeriksa akun SUPER_ADMIN...\n');

    // Cari semua akun SUPER_ADMIN
    const superAdmins = await prisma.pengguna.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        deletedAt: true,
        createdAt: true,
      },
    });

    if (superAdmins.length === 0) {
      console.log('❌ Tidak ada akun SUPER_ADMIN ditemukan di database.');
      console.log('💡 Anda perlu membuat akun SUPER_ADMIN baru.\n');
      
      // Buat akun SUPER_ADMIN baru
      const defaultPassword = 'superadmin123'; // Ganti dengan password yang aman
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      const newSuperAdmin = await prisma.pengguna.create({
        data: {
          nama: 'Super Administrator',
          username: 'superadmin',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          deletedAt: null,
        },
      });
      
      console.log('✅ Akun SUPER_ADMIN baru telah dibuat:');
      console.log(`   Username: ${newSuperAdmin.username}`);
      console.log(`   Password: ${defaultPassword}`);
      console.log(`   ⚠️  SEGERA GANTI PASSWORD SETELAH LOGIN!\n`);
      
    } else {
      console.log(`📊 Ditemukan ${superAdmins.length} akun SUPER_ADMIN:\n`);
      
      for (const admin of superAdmins) {
        console.log(`👤 ID: ${admin.id}`);
        console.log(`   Nama: ${admin.nama}`);
        console.log(`   Username: ${admin.username}`);
        console.log(`   Status: ${admin.deletedAt ? '❌ SOFT-DELETED (TIDAK AKTIF)' : '✅ AKTIF'}`);
        console.log(`   Dibuat: ${admin.createdAt.toLocaleString('id-ID')}`);
        
        // Perbaiki jika soft-deleted
        if (admin.deletedAt !== null) {
          console.log('   🔧 Memperbaiki akun (menghapus soft-delete)...');
          await prisma.pengguna.update({
            where: { id: admin.id },
            data: { deletedAt: null },
          });
          console.log('   ✅ Akun telah diperbaiki dan sekarang AKTIF!');
        }
        console.log('');
      }
      
      // Cek jika ada lebih dari 1 SUPER_ADMIN aktif
      const activeSuperAdmins = superAdmins.filter(admin => admin.deletedAt === null);
      if (activeSuperAdmins.length > 1) {
        console.log('⚠️  PERINGATAN: Ditemukan lebih dari 1 akun SUPER_ADMIN aktif!');
        console.log('   Sebaiknya hanya ada 1 akun SUPER_ADMIN aktif.\n');
      }
    }

    console.log('✅ Pemeriksaan selesai!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixSuperAdmin();
