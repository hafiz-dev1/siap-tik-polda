// Script untuk test password SUPER_ADMIN
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testSuperAdminPassword() {
  try {
    console.log('🔐 Testing SUPER_ADMIN Password\n');

    const username = 'superadmin';
    const passwordToTest = 'admin123';

    // Ambil data user dari database
    const pengguna = await prisma.pengguna.findUnique({
      where: { username },
      select: { 
        id: true, 
        nama: true,
        username: true,
        role: true, 
        password: true, 
        deletedAt: true 
      },
    });

    if (!pengguna) {
      console.log('❌ User tidak ditemukan!');
      return;
    }

    console.log('📋 Info User:');
    console.log(`   ID: ${pengguna.id}`);
    console.log(`   Nama: ${pengguna.nama}`);
    console.log(`   Username: ${pengguna.username}`);
    console.log(`   Role: ${pengguna.role}`);
    console.log(`   DeletedAt: ${pengguna.deletedAt || 'null (AKTIF)'}`);
    console.log(`   Password Hash: ${pengguna.password.substring(0, 20)}...`);
    console.log('');

    // Test validasi soft-delete
    if (pengguna.deletedAt !== null) {
      console.log('❌ MASALAH: User sudah di-soft-delete!');
      console.log('   Login akan ditolak karena deletedAt tidak null.');
      console.log('');
    } else {
      console.log('✅ Status: User AKTIF (deletedAt is null)');
      console.log('');
    }

    // Test password comparison
    console.log(`🔍 Testing password: "${passwordToTest}"`);
    const isPasswordValid = await bcrypt.compare(passwordToTest, pengguna.password);
    
    if (isPasswordValid) {
      console.log('✅ PASSWORD VALID - Password cocok!');
      console.log('');
    } else {
      console.log('❌ PASSWORD TIDAK VALID - Password tidak cocok!');
      console.log('   Kemungkinan password di database berbeda.');
      console.log('   Jalankan: npx ts-node reset-superadmin.ts');
      console.log('');
    }

    // Kesimpulan
    console.log('📊 Kesimpulan:');
    if (pengguna.deletedAt === null && isPasswordValid) {
      console.log('✅ User seharusnya BISA login!');
      console.log('   Jika masih error, cek:');
      console.log('   1. JWT_SECRET di .env file');
      console.log('   2. Browser console untuk error JavaScript');
      console.log('   3. Server terminal untuk error log');
    } else {
      if (pengguna.deletedAt !== null) {
        console.log('❌ User TIDAK BISA login - akun soft-deleted');
        console.log('   Solusi: Jalankan npx ts-node check-superadmin.ts');
      }
      if (!isPasswordValid) {
        console.log('❌ User TIDAK BISA login - password salah');
        console.log('   Solusi: Jalankan npx ts-node reset-superadmin.ts');
      }
    }
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSuperAdminPassword();
