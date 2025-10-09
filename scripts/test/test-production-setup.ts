// Script untuk test koneksi dan login dari production environment
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testProductionSetup() {
  console.log('🚀 TESTING PRODUCTION SETUP');
  console.log('='.repeat(60));
  
  try {
    // 1. Test Database Connection
    console.log('\n1️⃣ Testing Database Connection...');
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const endTime = Date.now();
    console.log(`   ✅ Database connected (${endTime - startTime}ms)`);
    console.log(`   📍 URL: ${process.env.DATABASE_URL?.substring(0, 30)}...`);

    // 2. Check Environment Variables
    console.log('\n2️⃣ Checking Environment Variables...');
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      JWT_SECRET: process.env.JWT_SECRET ? '✅ Set' : '❌ Not Set',
      DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Not Set',
      VERCEL: process.env.VERCEL,
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
    };
    
    console.log('   Environment:');
    Object.entries(envVars).forEach(([key, value]) => {
      if (value !== undefined) {
        console.log(`      ${key}: ${value}`);
      }
    });

    // 3. Check SUPERADMIN Account
    console.log('\n3️⃣ Checking SUPERADMIN Account...');
    const superAdmin = await prisma.pengguna.findFirst({
      where: {
        role: 'SUPER_ADMIN',
        deletedAt: null,
      },
      select: {
        id: true,
        username: true,
        nama: true,
        password: true,
        createdAt: true,
      },
    });

    if (!superAdmin) {
      console.log('   ❌ No active SUPERADMIN found!');
      console.log('   💡 Run: npx ts-node check-superadmin.ts');
      return;
    }

    console.log('   ✅ SUPERADMIN found:');
    console.log(`      Username: ${superAdmin.username}`);
    console.log(`      Name: ${superAdmin.nama}`);
    console.log(`      Created: ${superAdmin.createdAt.toLocaleString('id-ID')}`);

    // 4. Test Password
    console.log('\n4️⃣ Testing Password...');
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, superAdmin.password);
    
    if (isValid) {
      console.log(`   ✅ Password "${testPassword}" is valid`);
    } else {
      console.log(`   ❌ Password "${testPassword}" is invalid`);
      console.log('   💡 Run: npx ts-node reset-superadmin.ts');
    }

    // 5. Test Connection Pool
    console.log('\n5️⃣ Testing Connection Pool...');
    const connections = await Promise.all([
      prisma.$queryRaw`SELECT 1`,
      prisma.$queryRaw`SELECT 1`,
      prisma.$queryRaw`SELECT 1`,
    ]);
    console.log(`   ✅ Multiple connections successful (${connections.length})`);

    // 6. Count Users
    console.log('\n6️⃣ Checking Database Data...');
    const userCount = await prisma.pengguna.count({
      where: { deletedAt: null },
    });
    const suratCount = await prisma.surat.count();
    
    console.log(`   📊 Active Users: ${userCount}`);
    console.log(`   📋 Total Surat: ${suratCount}`);

    // Final Report
    console.log('\n' + '='.repeat(60));
    console.log('📊 PRODUCTION SETUP STATUS');
    console.log('='.repeat(60));
    
    const checks = {
      'Database Connection': true,
      'JWT_SECRET Set': !!process.env.JWT_SECRET,
      'SUPERADMIN Exists': !!superAdmin,
      'Password Valid': isValid,
      'Users in DB': userCount > 0,
    };

    let allPassed = true;
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${check}`);
      if (!passed) allPassed = false;
    });

    console.log('='.repeat(60));
    
    if (allPassed) {
      console.log('\n🎉 ALL CHECKS PASSED - READY FOR PRODUCTION!');
      console.log('\n📝 Login Credentials:');
      console.log(`   Username: ${superAdmin.username}`);
      console.log(`   Password: ${testPassword}`);
    } else {
      console.log('\n⚠️  SOME CHECKS FAILED - FIX BEFORE DEPLOYMENT!');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
    
    // Common errors
    console.log('\n💡 Common Solutions:');
    console.log('   1. Check DATABASE_URL is correct');
    console.log('   2. Run: npx prisma generate');
    console.log('   3. Run: npx prisma migrate deploy');
    console.log('   4. Check network/firewall settings');
    console.log('   5. Verify database is accessible from this IP');
    
  } finally {
    await prisma.$disconnect();
    console.log('\n👋 Disconnected from database');
  }
}

testProductionSetup();
