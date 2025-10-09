// Drop activityType column
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function dropOldColumn() {
  try {
    console.log('🔄 Dropping old activityType column...\n');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE activity_log DROP COLUMN IF EXISTS "activityType"
    `);

    console.log('✅ Column dropped successfully!');
    console.log('Run "npx prisma generate" to update Prisma Client\n');

  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

dropOldColumn();
