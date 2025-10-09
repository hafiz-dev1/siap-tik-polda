// Test script untuk verifikasi Base64 upload works
import { prisma } from '@/lib/prisma';

async function testBase64Upload() {
  console.log('🧪 Testing Base64 Upload Implementation...\n');

  // Test 1: Check database schema
  console.log('1️⃣ Checking database schema...');
  try {
    const user = await prisma.pengguna.findFirst({
      select: { 
        profilePictureUrl: true 
      }
    });
    console.log('   ✅ Database connection OK');
    console.log('   📊 Sample profilePictureUrl type:', typeof user?.profilePictureUrl);
    
    if (user?.profilePictureUrl) {
      const isBase64 = user.profilePictureUrl.startsWith('data:');
      console.log('   📸 Has profile picture:', isBase64 ? 'Base64 ✅' : 'File Path ⚠️');
      console.log('   📏 Length:', user.profilePictureUrl.length, 'chars');
    }
  } catch (error) {
    console.error('   ❌ Database error:', error);
  }

  // Test 2: Check lampiran schema
  console.log('\n2️⃣ Checking lampiran schema...');
  try {
    const lampiran = await prisma.lampiran.findFirst({
      select: { 
        path_file: true,
        nama_file: true 
      }
    });
    
    if (lampiran?.path_file) {
      const isBase64 = lampiran.path_file.startsWith('data:');
      console.log('   ✅ Lampiran found');
      console.log('   📄 File name:', lampiran.nama_file);
      console.log('   📸 Storage type:', isBase64 ? 'Base64 ✅' : 'File Path ⚠️');
      console.log('   📏 Length:', lampiran.path_file.length, 'chars');
    } else {
      console.log('   ℹ️  No lampiran in database yet');
    }
  } catch (error) {
    console.error('   ❌ Database error:', error);
  }

  // Test 3: Simulate Base64 encoding
  console.log('\n3️⃣ Testing Base64 encoding simulation...');
  try {
    const testData = 'Hello World - Test File Content';
    const buffer = Buffer.from(testData);
    const base64 = buffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${base64}`;
    
    console.log('   ✅ Encoding works');
    console.log('   📊 Original:', testData.length, 'bytes');
    console.log('   📊 Base64:', base64.length, 'chars');
    console.log('   📊 Data URI:', dataUri.length, 'chars');
    console.log('   📊 Overhead:', ((dataUri.length / testData.length - 1) * 100).toFixed(1), '%');
  } catch (error) {
    console.error('   ❌ Encoding error:', error);
  }

  // Test 4: Test file size limits
  console.log('\n4️⃣ Testing file size calculations...');
  const sizes = [
    { name: 'Small photo', bytes: 100 * 1024 },     // 100KB
    { name: 'Medium photo', bytes: 500 * 1024 },    // 500KB
    { name: 'Large photo', bytes: 2 * 1024 * 1024 }, // 2MB
    { name: 'Small PDF', bytes: 1 * 1024 * 1024 },   // 1MB
    { name: 'Large PDF', bytes: 3 * 1024 * 1024 },   // 3MB
  ];

  sizes.forEach(({ name, bytes }) => {
    const base64Size = Math.ceil(bytes * 4/3);
    const dataUriSize = base64Size + 50; // ~50 chars for data:image/jpeg;base64,
    const sizeOk = dataUriSize < 16 * 1024 * 1024; // PostgreSQL text limit ~16MB
    
    console.log(`   ${sizeOk ? '✅' : '⚠️ '} ${name}: ${(bytes/1024/1024).toFixed(2)}MB → ${(dataUriSize/1024/1024).toFixed(2)}MB Base64`);
  });

  console.log('\n✨ Test completed!\n');
}

// Run if called directly
if (require.main === module) {
  testBase64Upload()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

export { testBase64Upload };
