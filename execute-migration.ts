// Script untuk execute migration SQL
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function executeMigration() {
  try {
    console.log('🔄 Executing migration...\n');

    // Read SQL file
    const sqlPath = join(process.cwd(), 'migrations', 'manual_add_activity_log.sql');
    const sql = readFileSync(sqlPath, 'utf-8');

    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length < 10) continue; // Skip very short statements
      
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      console.log(`Preview: ${statement.substring(0, 60)}...`);
      
      try {
        await prisma.$executeRawUnsafe(statement);
        console.log('✅ Success\n');
      } catch (error: any) {
        // Ignore if already exists
        if (error.message.includes('already exists')) {
          console.log('⚠️  Already exists, skipping\n');
        } else {
          console.error('❌ Error:', error.message);
          console.error('Statement:', statement.substring(0, 200));
          throw error;
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('Next step: Run "npx prisma generate" to update Prisma Client\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

executeMigration();
