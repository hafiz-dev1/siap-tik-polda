// Helper script untuk setup database production
// Usage: npx tsx setup-production-db.ts

import { execSync } from 'child_process';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupProductionDB() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   🚀 PRODUCTION DATABASE SETUP - Activity Log            ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Ask for DATABASE_URL
    console.log('📋 Step 1: Database Configuration\n');
    const dbUrl = await question('Enter your PRODUCTION DATABASE_URL: ');

    if (!dbUrl || dbUrl.trim() === '') {
      console.log('\n❌ Error: DATABASE_URL cannot be empty!');
      process.exit(1);
    }

    // Step 2: Test connection
    console.log('\n📡 Step 2: Testing database connection...');
    try {
      const testCmd = process.platform === 'win32' 
        ? `$env:DATABASE_URL="${dbUrl}"; psql $env:DATABASE_URL -c "SELECT version();"` 
        : `DATABASE_URL="${dbUrl}" psql $DATABASE_URL -c "SELECT version();"`;
      
      execSync(testCmd, { stdio: 'inherit', shell: 'powershell.exe' });
      console.log('✅ Database connection successful!\n');
    } catch (error) {
      console.log('❌ Database connection failed!');
      console.log('Please check your DATABASE_URL and try again.\n');
      process.exit(1);
    }

    // Step 3: Check if table already exists
    console.log('🔍 Step 3: Checking if activity_log table exists...');
    try {
      const checkCmd = process.platform === 'win32'
        ? `$env:DATABASE_URL="${dbUrl}"; psql $env:DATABASE_URL -c "SELECT COUNT(*) FROM activity_log;"`
        : `DATABASE_URL="${dbUrl}" psql $DATABASE_URL -c "SELECT COUNT(*) FROM activity_log;"`;
      
      execSync(checkCmd, { stdio: 'inherit', shell: 'powershell.exe' });
      console.log('\n⚠️  Table activity_log already exists!');
      
      const overwrite = await question('\nDo you want to DROP and RECREATE the table? (yes/no): ');
      
      if (overwrite.toLowerCase() === 'yes') {
        console.log('\n🗑️  Dropping existing table...');
        const dropCmd = process.platform === 'win32'
          ? `$env:DATABASE_URL="${dbUrl}"; psql $env:DATABASE_URL -c "DROP TABLE IF EXISTS activity_log CASCADE;"`
          : `DATABASE_URL="${dbUrl}" psql $DATABASE_URL -c "DROP TABLE IF EXISTS activity_log CASCADE;"`;
        
        execSync(dropCmd, { stdio: 'inherit', shell: 'powershell.exe' });
        console.log('✅ Table dropped!\n');
      } else {
        console.log('\n✅ Keeping existing table. Will attempt to alter if needed.\n');
      }
    } catch (error) {
      console.log('ℹ️  Table does not exist yet (this is normal for first setup)\n');
    }

    // Step 4: Run migration
    console.log('📦 Step 4: Running migration...');
    const confirm = await question('Proceed with migration? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('\n❌ Migration cancelled by user.');
      process.exit(0);
    }

    console.log('\n🚀 Running migration file...');
    const migrationCmd = process.platform === 'win32'
      ? `$env:DATABASE_URL="${dbUrl}"; psql $env:DATABASE_URL -f migrations/manual_add_activity_log.sql`
      : `DATABASE_URL="${dbUrl}" psql $DATABASE_URL -f migrations/manual_add_activity_log.sql`;
    
    execSync(migrationCmd, { stdio: 'inherit', shell: 'powershell.exe' });
    console.log('✅ Migration completed!\n');

    // Step 5: Verify
    console.log('✅ Step 5: Verifying migration...');
    const verifyCmd = process.platform === 'win32'
      ? `$env:DATABASE_URL="${dbUrl}"; psql $env:DATABASE_URL -c "\\d activity_log"`
      : `DATABASE_URL="${dbUrl}" psql $DATABASE_URL -c "\\d activity_log"`;
    
    execSync(verifyCmd, { stdio: 'inherit', shell: 'powershell.exe' });

    // Step 6: Success message
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ SETUP COMPLETE - Database is ready!                 ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    console.log('📋 Next Steps:\n');
    console.log('1. Run debug script to verify:');
    console.log('   npx tsx debug-log-activity-production.ts\n');
    console.log('2. Deploy your application:');
    console.log('   git add .');
    console.log('   git commit -m "fix: setup activity log for production"');
    console.log('   git push\n');
    console.log('3. Test health check after deploy:');
    console.log('   curl https://your-app.vercel.app/api/health/activity-log\n');
    console.log('4. Open /log-activity in browser\n');

  } catch (error) {
    console.error('\n❌ Error during setup:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run setup
setupProductionDB().catch(console.error);
