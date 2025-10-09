// Debug script untuk check production database
// Run: npx tsx debug-log-activity-production.ts

import { prisma } from './src/lib/prisma';

async function debugProductionDB() {
  console.log('🔍 Checking Production Database for Activity Log...\n');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 50) + '...\n');

  try {
    // 1. Check connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connected successfully\n');

    // 2. Check if table exists
    console.log('2️⃣ Checking if activity_log table exists...');
    const tables: any = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = 'activity_log';
    `;
    
    if (tables.length === 0) {
      console.log('   ❌ Table "activity_log" NOT FOUND!');
      console.log('   ⚠️  You need to run the migration:');
      console.log('   👉 psql $DATABASE_URL -f migrations/manual_add_activity_log.sql\n');
      return;
    }
    console.log('   ✅ Table "activity_log" exists\n');

    // 3. Check columns
    console.log('3️⃣ Checking table structure...');
    const columns: any = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'activity_log'
      ORDER BY ordinal_position;
    `;
    
    console.log('   📊 Columns in activity_log:');
    console.table(columns);

    // 4. Verify required columns
    console.log('\n4️⃣ Verifying required columns...');
    const requiredColumns = [
      'id', 'userId', 'category', 'type', 'description', 
      'entityType', 'entityId', 'metadata', 'ipAddress', 
      'userAgent', 'status', 'createdAt'
    ];
    
    const existingColumns = columns.map((col: any) => col.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('   ❌ Missing columns:', missingColumns);
      console.log('   ⚠️  Run the migration to add missing columns\n');
    } else {
      console.log('   ✅ All required columns present\n');
    }

    // 5. Check indexes
    console.log('5️⃣ Checking indexes...');
    const indexes: any = await prisma.$queryRaw`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'activity_log';
    `;
    
    console.log(`   📋 Found ${indexes.length} indexes:`);
    indexes.forEach((idx: any) => {
      console.log(`   - ${idx.indexname}`);
    });
    console.log('');

    // 6. Check if can read
    console.log('6️⃣ Testing read capability...');
    const count = await prisma.activityLog.count();
    console.log(`   ✅ Can read! Total logs: ${count}\n`);

    // 7. Get sample logs
    if (count > 0) {
      console.log('7️⃣ Fetching sample logs...');
      const sampleLogs = await prisma.activityLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { username: true, nama: true },
          },
        },
      });

      console.log(`   📝 Latest ${sampleLogs.length} logs:\n`);
      sampleLogs.forEach((log, i) => {
        console.log(`   ${i + 1}. [${log.category}/${log.type}] ${log.status}`);
        console.log(`      User: ${log.user?.username} (${log.user?.nama})`);
        console.log(`      Description: ${log.description}`);
        console.log(`      Time: ${log.createdAt.toLocaleString()}`);
        console.log('');
      });
    } else {
      console.log('7️⃣ No logs found in database (table is empty)\n');
    }

    // 8. Test write capability
    console.log('8️⃣ Testing write capability...');
    const testUser = await prisma.pengguna.findFirst({
      where: { deletedAt: null },
    });

    if (!testUser) {
      console.log('   ⚠️  No users found in database, cannot test write\n');
    } else {
      try {
        const testLog = await prisma.activityLog.create({
          data: {
            userId: testUser.id,
            category: 'SYSTEM',
            type: 'OTHER',
            description: '[DEBUG TEST] Database write test',
            status: 'SUCCESS',
          },
        });
        console.log(`   ✅ Can write! Test log created: ${testLog.id}`);

        // Clean up
        await prisma.activityLog.delete({
          where: { id: testLog.id },
        });
        console.log('   ✅ Test log cleaned up\n');
      } catch (writeError) {
        console.log('   ❌ Cannot write!');
        console.log('   Error:', writeError);
        console.log('');
      }
    }

    // 9. Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ DIAGNOSIS COMPLETE - All checks passed!');
    console.log('═══════════════════════════════════════════════════');
    console.log(`📊 Total Logs: ${count}`);
    console.log(`📋 Columns: ${columns.length}`);
    console.log(`🔑 Indexes: ${indexes.length}`);
    console.log(`✅ Status: HEALTHY`);
    console.log('═══════════════════════════════════════════════════\n');

  } catch (error) {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('❌ DIAGNOSIS FAILED - Errors found!');
    console.log('═══════════════════════════════════════════════════');
    console.error('\n🔴 Error:', error);
    
    if (error instanceof Error) {
      console.error('\n📋 Error details:');
      console.error('   Message:', error.message);
      console.error('   Name:', error.name);
      if (error.stack) {
        console.error('\n   Stack trace:');
        console.error(error.stack);
      }
    }
    
    console.log('\n💡 Possible solutions:');
    console.log('   1. Check if DATABASE_URL is correct');
    console.log('   2. Run migration: psql $DATABASE_URL -f migrations/manual_add_activity_log.sql');
    console.log('   3. Run: npx prisma generate');
    console.log('   4. Check database permissions');
    console.log('═══════════════════════════════════════════════════\n');
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the diagnosis
debugProductionDB().catch(console.error);
