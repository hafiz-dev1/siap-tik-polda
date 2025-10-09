/**
 * Script untuk test upload di production Vercel
 * Jalankan di browser console saat berada di halaman upload
 */

// Test 1: Cek apakah Base64 encoding berfungsi
function testBase64Encoding() {
  console.log('🧪 Test 1: Base64 Encoding');
  
  // Simulasi file kecil
  const testString = 'Hello World - Test Content';
  const encoder = new TextEncoder();
  const bytes = encoder.encode(testString);
  
  // Convert ke base64 (browser native)
  let base64;
  if (typeof btoa !== 'undefined') {
    base64 = btoa(String.fromCharCode(...bytes));
  } else {
    console.error('❌ btoa not available');
    return false;
  }
  
  const dataUri = `data:text/plain;base64,${base64}`;
  
  console.log('   ✅ Original:', testString);
  console.log('   ✅ Base64:', base64);
  console.log('   ✅ Data URI:', dataUri);
  console.log('   📊 Size: ' + testString.length + ' → ' + dataUri.length + ' bytes');
  
  return true;
}

// Test 2: Simulasi upload foto
async function testPhotoUpload(fileInput) {
  console.log('🧪 Test 2: Photo Upload Simulation');
  
  if (!fileInput || !fileInput.files || !fileInput.files[0]) {
    console.error('❌ No file selected');
    return;
  }
  
  const file = fileInput.files[0];
  console.log('   📸 File:', file.name);
  console.log('   📏 Size:', (file.size / 1024).toFixed(2), 'KB');
  console.log('   📋 Type:', file.type);
  
  // Check size limit
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    console.error('   ❌ File too large! Max 2MB');
    return;
  }
  
  // Read as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  
  // Convert to base64
  let binary = '';
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  const base64 = btoa(binary);
  const dataUri = `data:${file.type};base64,${base64}`;
  
  console.log('   ✅ Base64 length:', base64.length, 'chars');
  console.log('   ✅ Data URI length:', dataUri.length, 'chars');
  console.log('   📊 Overhead:', ((dataUri.length / file.size - 1) * 100).toFixed(1), '%');
  console.log('   ✅ Preview (first 100 chars):', dataUri.substring(0, 100) + '...');
  
  // Test if it can be displayed
  const img = document.createElement('img');
  img.src = dataUri;
  img.style.maxWidth = '200px';
  img.style.border = '2px solid green';
  img.onload = () => console.log('   ✅ Image loaded successfully!');
  img.onerror = () => console.error('   ❌ Failed to load image');
  
  console.log('   📸 Image element created (check below):');
  console.log(img);
  
  return dataUri;
}

// Test 3: Check form submission
function testFormData() {
  console.log('🧪 Test 3: FormData Check');
  
  const formData = new FormData();
  const testFile = new Blob(['test content'], { type: 'image/jpeg' });
  formData.append('profilePicture', testFile, 'test.jpg');
  
  console.log('   ✅ FormData created');
  console.log('   ✅ Has profilePicture:', formData.has('profilePicture'));
  
  const file = formData.get('profilePicture');
  console.log('   ✅ File size:', file.size, 'bytes');
  
  return true;
}

// Cara pakai:
console.log('📋 INSTRUKSI TESTING DI BROWSER:');
console.log('');
console.log('1. Test encoding:');
console.log('   testBase64Encoding()');
console.log('');
console.log('2. Test form data:');
console.log('   testFormData()');
console.log('');
console.log('3. Test photo upload (pilih file dulu):');
console.log('   const fileInput = document.querySelector(\'input[type="file"]\')');
console.log('   testPhotoUpload(fileInput)');
console.log('');
console.log('4. Check network tab untuk melihat request payload');
console.log('');
