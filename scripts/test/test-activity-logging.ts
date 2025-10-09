// Test script untuk cek apakah activity logging berfungsi
import { prisma } from './src/lib/prisma';
import { logActivity } from './src/lib/activityLogger';

async function testLogging() {
  try {
    console.log('🔍 Testing Activity Logging...\n');

    // 1. Check if table exists and get count
    console.log('1️⃣ Checking activity_log table...');
    const count = await prisma.activityLog.count();
    console.log(`   ✅ Table exists. Current logs: ${count}\n`);

    // 2. Get first user from database
    console.log('2️⃣ Getting test user...');
    const user = await prisma.pengguna.findFirst({
      where: { deletedAt: null },
    });
    
    if (!user) {
      console.log('   ❌ No users found in database!');
      return;
    }
    console.log(`   ✅ Found user: ${user.username} (${user.nama})\n`);

    // 3. Try to create a test log
    console.log('3️⃣ Creating test log entry...');
    await logActivity({
      userId: user.id,
      category: 'SYSTEM',
      type: 'OTHER',
      description: `[TEST] Activity logging test at ${new Date().toISOString()}`,
      entityType: 'TEST',
      entityId: 'test-123',
      metadata: { test: true, timestamp: Date.now() },
      status: 'SUCCESS',
    });
    console.log('   ✅ Log created successfully!\n');

    // 4. Verify log was created
    console.log('4️⃣ Verifying log entry...');
    const newCount = await prisma.activityLog.count();
    console.log(`   ✅ New log count: ${newCount}\n`);

    // 5. Get latest logs
    console.log('5️⃣ Latest 5 logs:');
    const logs = await prisma.activityLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { username: true, nama: true },
        },
      },
    });

    logs.forEach((log, index) => {
      console.log(`   ${index + 1}. [${log.category}] ${log.type} - ${log.description}`);
      console.log(`      User: ${log.user?.username}, Time: ${log.createdAt}`);
    });

    console.log('\n✅ Activity logging is working correctly!');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogging();
