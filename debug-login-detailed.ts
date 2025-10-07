// Script untuk debug login dengan detail lengkap
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function debugLoginDetailed() {
  console.log('🔍 DEBUGGING LOGIN SUPERADMIN - DETAILED ANALYSIS');
  console.log('='.repeat(70));
  console.log('Tanggal:', new Date().toLocaleString('id-ID'));
  console.log('='.repeat(70));
  
  try {
    // 1. Environment Check
    console.log('\n📋 STEP 1: ENVIRONMENT VARIABLES CHECK');
    console.log('-'.repeat(70));
    
    const envCheck = {
      DATABASE_URL: process.env.DATABASE_URL ? '✅ Ada' : '❌ TIDAK ADA',
      JWT_SECRET: process.env.JWT_SECRET ? '✅ Ada' : '❌ TIDAK ADA',
      NODE_ENV: process.env.NODE_ENV || 'tidak di-set',
    };
    
    console.log('Environment Variables:');
    Object.entries(envCheck).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    if (!process.env.DATABASE_URL) {
      console.log('\n❌ FATAL: DATABASE_URL tidak ada!');
      return;
    }
    
    if (!process.env.JWT_SECRET) {
      console.log('\n❌ FATAL: JWT_SECRET tidak ada!');
      return;
    }
    
    console.log(`\nJWT_SECRET length: ${process.env.JWT_SECRET.length} karakter`);
    console.log(`DATABASE_URL prefix: ${process.env.DATABASE_URL.substring(0, 30)}...`);

    // 2. Database Connection Test
    console.log('\n📋 STEP 2: DATABASE CONNECTION TEST');
    console.log('-'.repeat(70));
    
    const dbStart = Date.now();
    try {
      await prisma.$connect();
      const dbEnd = Date.now();
      console.log(`✅ Database connected successfully (${dbEnd - dbStart}ms)`);
      
      // Test query
      const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Test query berhasil:', testQuery);
    } catch (dbError) {
      console.log('❌ Database connection GAGAL!');
      console.error('Error:', dbError);
      return;
    }

    // 3. Find SUPERADMIN Account
    console.log('\n📋 STEP 3: MENCARI AKUN SUPERADMIN');
    console.log('-'.repeat(70));
    
    const superadmins = await prisma.pengguna.findMany({
      where: {
        role: 'SUPER_ADMIN',
      },
      select: {
        id: true,
        nama: true,
        username: true,
        password: true,
        role: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    console.log(`Total akun SUPER_ADMIN di database: ${superadmins.length}`);
    
    if (superadmins.length === 0) {
      console.log('❌ TIDAK ADA akun SUPER_ADMIN!');
      console.log('💡 Solusi: Jalankan npx ts-node check-superadmin.ts');
      return;
    }
    
    console.log('\nDetail semua akun SUPER_ADMIN:');
    superadmins.forEach((admin, index) => {
      console.log(`\n  Akun #${index + 1}:`);
      console.log(`    ID: ${admin.id}`);
      console.log(`    Nama: ${admin.nama}`);
      console.log(`    Username: ${admin.username}`);
      console.log(`    Role: ${admin.role}`);
      console.log(`    Deleted: ${admin.deletedAt ? '❌ YA (SOFT-DELETED)' : '✅ TIDAK (AKTIF)'}`);
      console.log(`    Created: ${admin.createdAt.toLocaleString('id-ID')}`);
      console.log(`    Updated: ${admin.updatedAt.toLocaleString('id-ID')}`);
      console.log(`    Password hash: ${admin.password.substring(0, 30)}...`);
    });

    // 4. Filter Active SUPERADMIN
    console.log('\n📋 STEP 4: FILTER AKUN SUPERADMIN AKTIF');
    console.log('-'.repeat(70));
    
    const activeSuperadmin = superadmins.filter(a => a.deletedAt === null);
    console.log(`Akun SUPER_ADMIN aktif: ${activeSuperadmin.length}`);
    
    if (activeSuperadmin.length === 0) {
      console.log('❌ TIDAK ADA akun SUPER_ADMIN yang aktif!');
      console.log('💡 Semua akun sudah di-soft-delete');
      console.log('💡 Solusi: Jalankan npx ts-node check-superadmin.ts');
      return;
    }

    // 5. Password Testing
    console.log('\n📋 STEP 5: PASSWORD TESTING');
    console.log('-'.repeat(70));
    
    const testUser = activeSuperadmin[0];
    console.log(`\nTesting untuk user: ${testUser.username}`);
    
    const passwordsToTest = [
      'admin123',
      'superadmin123',
      'Admin123',
      'password',
      '123456'
    ];
    
    let validPassword = null;
    for (const testPass of passwordsToTest) {
      const isValid = await bcrypt.compare(testPass, testUser.password);
      if (isValid) {
        console.log(`  ✅ Password VALID: "${testPass}"`);
        validPassword = testPass;
        break;
      } else {
        console.log(`  ❌ Password invalid: "${testPass}"`);
      }
    }
    
    if (!validPassword) {
      console.log('\n❌ TIDAK ADA password yang cocok dari daftar!');
      console.log('💡 Password mungkin sudah diganti atau berbeda');
      console.log('💡 Solusi: Jalankan npx ts-node reset-superadmin.ts');
      return;
    }

    // 6. Simulate Login Flow
    console.log('\n📋 STEP 6: SIMULASI FULL LOGIN FLOW');
    console.log('-'.repeat(70));
    
    console.log('\nMenjalankan simulasi seperti di login route...\n');
    
    // Step 6.1: Find user
    console.log('6.1) Mencari user dengan username "superadmin"...');
    const pengguna = await prisma.pengguna.findUnique({
      where: { username: 'superadmin' },
      select: { id: true, role: true, password: true, deletedAt: true },
    });
    
    if (!pengguna) {
      console.log('   ❌ User tidak ditemukan');
      return;
    }
    console.log('   ✅ User ditemukan:', {
      id: pengguna.id,
      role: pengguna.role,
      deletedAt: pengguna.deletedAt,
    });
    
    // Step 6.2: Check soft-delete
    console.log('\n6.2) Checking soft-delete status...');
    if (pengguna.deletedAt !== null) {
      console.log('   ❌ User sudah di-soft-delete!');
      console.log('   💡 Login akan ditolak oleh route');
      return;
    }
    console.log('   ✅ User AKTIF (deletedAt is null)');
    
    // Step 6.3: Verify password
    console.log('\n6.3) Verifying password...');
    const isPasswordValid = await bcrypt.compare(validPassword, pengguna.password);
    if (!isPasswordValid) {
      console.log('   ❌ Password tidak valid');
      return;
    }
    console.log(`   ✅ Password valid: "${validPassword}"`);
    
    // Step 6.4: Check JWT_SECRET
    console.log('\n6.4) Checking JWT_SECRET...');
    if (!process.env.JWT_SECRET) {
      console.log('   ❌ JWT_SECRET tidak ada!');
      return;
    }
    console.log('   ✅ JWT_SECRET ada');
    
    // Step 6.5: Create JWT token
    console.log('\n6.5) Creating JWT token...');
    try {
      const token = jwt.sign(
        { operatorId: pengguna.id, role: pengguna.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      console.log('   ✅ Token created successfully');
      console.log(`   Token preview: ${token.substring(0, 50)}...`);
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('   ✅ Token verification successful');
      console.log('   Payload:', decoded);
    } catch (tokenError) {
      console.log('   ❌ Token creation/verification GAGAL!');
      console.error('   Error:', tokenError);
      return;
    }

    // 7. Final Analysis
    console.log('\n' + '='.repeat(70));
    console.log('📊 KESIMPULAN ANALISIS');
    console.log('='.repeat(70));
    
    const checks = {
      '1. DATABASE_URL ada': !!process.env.DATABASE_URL,
      '2. JWT_SECRET ada': !!process.env.JWT_SECRET,
      '3. Database connection': true,
      '4. Akun SUPERADMIN exists': superadmins.length > 0,
      '5. Akun SUPERADMIN aktif': activeSuperadmin.length > 0,
      '6. Password valid': !!validPassword,
      '7. User NOT soft-deleted': pengguna.deletedAt === null,
      '8. JWT token creation works': true,
    };
    
    let allPassed = true;
    Object.entries(checks).forEach(([check, passed]) => {
      const icon = passed ? '✅' : '❌';
      console.log(`${icon} ${check}`);
      if (!passed) allPassed = false;
    });
    
    console.log('\n' + '='.repeat(70));
    
    if (allPassed) {
      console.log('\n🎉 SEMUA CHECKS PASSED!');
      console.log('\n📝 KREDENSIAL LOGIN YANG VALID:');
      console.log(`   Username: ${testUser.username}`);
      console.log(`   Password: ${validPassword}`);
      console.log('\n⚠️  JIKA MASIH TIDAK BISA LOGIN DI SERVER ONLINE:');
      console.log('\n   Kemungkinan masalah ada di server deployment, bukan di database!');
      console.log('\n   Cek hal berikut:');
      console.log('   1. Apakah environment variables (DATABASE_URL, JWT_SECRET) sudah di-set di server?');
      console.log('   2. Apakah server sudah restart setelah update env vars?');
      console.log('   3. Cek browser console untuk error JavaScript');
      console.log('   4. Cek server logs (vercel logs / railway logs)');
      console.log('   5. Apakah build process berhasil? (prisma generate)');
      console.log('   6. Test dengan curl:');
      console.log('      curl -X POST https://your-domain.com/api/auth/login \\');
      console.log('        -H "Content-Type: application/json" \\');
      console.log(`        -d '{"username":"${testUser.username}","password":"${validPassword}"}' \\`);
      console.log('        -v');
      console.log('\n   7. Cek Network tab di browser:');
      console.log('      - Apakah request ke /api/auth/login ada?');
      console.log('      - Apa status code-nya? (harus 204)');
      console.log('      - Apakah ada Set-Cookie header di response?');
      console.log('      - Apakah ada error di Console tab?');
    } else {
      console.log('\n❌ ADA MASALAH YANG PERLU DIPERBAIKI!');
      console.log('   Lihat hasil check di atas untuk detail.');
    }
    
    console.log('\n' + '='.repeat(70));

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
    console.log('\n👋 Database disconnected');
  }
}

debugLoginDetailed();
