// Run migration to alter activity_log table
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('🔄 Updating activity_log table...\n');

    // Step 1: Add columns
    console.log('1️⃣ Adding missing columns...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS category TEXT
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS type TEXT
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS "entityType" TEXT
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS "entityId" TEXT
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'SUCCESS'
    `);
    console.log('   ✅ Columns added\n');

    // Step 2: Set defaults for existing records
    console.log('2️⃣ Setting default values for existing records...');
    await prisma.$executeRawUnsafe(`
      UPDATE activity_log SET category = 'SYSTEM' WHERE category IS NULL
    `);
    await prisma.$executeRawUnsafe(`
      UPDATE activity_log SET type = 'OTHER' WHERE type IS NULL
    `);
    await prisma.$executeRawUnsafe(`
      UPDATE activity_log SET status = 'SUCCESS' WHERE status IS NULL
    `);
    console.log('   ✅ Defaults set\n');

    // Step 3: Make columns NOT NULL
    console.log('3️⃣ Setting NOT NULL constraints...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE activity_log ALTER COLUMN category SET NOT NULL
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE activity_log ALTER COLUMN type SET NOT NULL
    `);
    console.log('   ✅ Constraints set\n');

    // Step 4: Create indexes
    console.log('4️⃣ Creating indexes...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "activity_log_category_idx" ON activity_log(category)
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "activity_log_type_idx" ON activity_log(type)
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "activity_log_entityType_idx" ON activity_log("entityType")
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "activity_log_status_idx" ON activity_log(status)
    `);
    console.log('   ✅ Indexes created\n');

    console.log('✅ Migration completed successfully!');
    console.log('Next step: Update schema.prisma and run "npx prisma db pull" then "npx prisma generate"\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
