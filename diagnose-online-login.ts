// Script untuk mendiagnosa masalah login superadmin di server online
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function diagnoseOnlineLogin() {
  try {
    console.log('🔍 DIAGNOSA MASALAH LOGIN SUPERADMIN DI SERVER ONLINE\n');
    console.log('='.repeat(60));
    
    // 1. Cek koneksi database
    console.log('\n1️⃣ MENGECEK KONEKSI DATABASE...');
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('   ✅ Database terkoneksi dengan sukses');
      console.log('   📍 Database URL:', process.env.DATABASE_URL?.substring(0, 30) + '...');
    } catch (error) {
      console.log('   ❌ GAGAL koneksi ke database!');
      console.error('   Error:', error);
      return;
    }

    // 2. Cek JWT_SECRET
    console.log('\n2️⃣ MENGECEK JWT_SECRET...');
    if (process.env.JWT_SECRET) {
      console.log('   ✅ JWT_SECRET ada');
      console.log('   📏 Panjang:', process.env.JWT_SECRET.length, 'karakter');
    } else {
      console.log('   ❌ JWT_SECRET TIDAK DITEMUKAN!');
      console.log('   ⚠️  Ini akan menyebabkan error 500 saat login');
    }

    // 3. Cek akun SUPERADMIN di database
    console.log('\n3️⃣ MENGECEK AKUN SUPERADMIN DI DATABASE...');
    const superAdmins = await prisma.pengguna.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        password: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (superAdmins.length === 0) {
      console.log('   ❌ TIDAK ADA AKUN SUPERADMIN!');
      console.log('   💡 Solusi: Buat akun superadmin dengan script seed atau check-superadmin.ts');
      return;
    }

    console.log(`   ✅ Ditemukan ${superAdmins.length} akun SUPERADMIN:\n`);

    for (const admin of superAdmins) {
      console.log('   📋 Detail Akun:');
      console.log('      ID:', admin.id);
      console.log('      Nama:', admin.nama);
      console.log('      Username:', admin.username);
      console.log('      Role:', admin.role);
      console.log('      Deleted:', admin.deletedAt ? '❌ YA (SOFT-DELETED)' : '✅ TIDAK (AKTIF)');
      console.log('      Created:', admin.createdAt.toLocaleString('id-ID'));
      console.log('      Updated:', admin.updatedAt.toLocaleString('id-ID'));
      console.log('      Password Hash:', admin.password.substring(0, 30) + '...');
      
      // 4. Test password
      console.log('\n   🔑 TESTING PASSWORD...');
      const testPasswords = ['admin123', 'superadmin123', 'Admin123'];
      
      for (const testPass of testPasswords) {
        const isValid = await bcrypt.compare(testPass, admin.password);
        if (isValid) {
          console.log(`      ✅ Password cocok: "${testPass}"`);
        } else {
          console.log(`      ❌ Password tidak cocok: "${testPass}"`);
        }
      }
      console.log('');
    }

    // 5. Simulasi login check
    console.log('\n4️⃣ SIMULASI VALIDASI LOGIN...');
    const activeAdmin = superAdmins.find(a => a.deletedAt === null);
    
    if (!activeAdmin) {
      console.log('   ❌ TIDAK ADA SUPERADMIN YANG AKTIF!');
      console.log('   💡 Semua akun sudah di-soft-delete');
      console.log('   💡 Solusi: Jalankan npx ts-node check-superadmin.ts untuk restore');
      return;
    }

    console.log('   ✅ Ada akun SUPERADMIN yang aktif');
    console.log('   Username:', activeAdmin.username);
    
    // Test dengan password default
    const defaultPassword = 'admin123';
    const isPasswordValid = await bcrypt.compare(defaultPassword, activeAdmin.password);
    
    console.log(`\n   🧪 Test login dengan password "${defaultPassword}":`);
    if (isPasswordValid) {
      console.log('   ✅ VALIDASI BERHASIL - Seharusnya bisa login!');
    } else {
      console.log('   ❌ VALIDASI GAGAL - Password salah!');
      console.log('   💡 Solusi: Reset password dengan npx ts-node reset-superadmin.ts');
    }

    // 6. Kesimpulan
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 KESIMPULAN:');
    console.log('='.repeat(60));
    
    const hasJwtSecret = !!process.env.JWT_SECRET;
    const hasActiveAdmin = !!activeAdmin;
    const hasValidPassword = isPasswordValid;
    
    if (hasJwtSecret && hasActiveAdmin && hasValidPassword) {
      console.log('\n✅ SEMUA PERSYARATAN TERPENUHI - LOGIN SEHARUSNYA BISA!');
      console.log('\n🤔 Jika masih tidak bisa login di server online, cek:');
      console.log('   1. Apakah .env file ter-deploy dengan benar di server?');
      console.log('   2. Apakah server sudah restart setelah update .env?');
      console.log('   3. Cek console browser untuk error JavaScript');
      console.log('   4. Cek log server untuk error detail');
      console.log('   5. Apakah database URL di server sama dengan yang di .env?');
      console.log('   6. Test dengan: curl -X POST server.com/api/auth/login -d \'{"username":"superadmin","password":"admin123"}\'');
    } else {
      console.log('\n❌ ADA MASALAH YANG PERLU DIPERBAIKI:');
      if (!hasJwtSecret) console.log('   ❌ JWT_SECRET tidak ada di .env');
      if (!hasActiveAdmin) console.log('   ❌ Tidak ada akun SUPERADMIN yang aktif');
      if (!hasValidPassword) console.log('   ❌ Password tidak cocok dengan "admin123"');
    }

    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseOnlineLogin();
