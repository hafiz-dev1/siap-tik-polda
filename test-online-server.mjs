// Test login ke server online
// Ganti SERVER_URL dengan URL server online Anda

const SERVER_URL = 'https://your-domain.vercel.app'; // ⚠️ GANTI INI!

async function testOnlineLogin() {
  console.log('🌐 TESTING LOGIN KE SERVER ONLINE');
  console.log('='.repeat(70));
  console.log('Server URL:', SERVER_URL);
  console.log('Timestamp:', new Date().toLocaleString('id-ID'));
  console.log('='.repeat(70));

  if (SERVER_URL.includes('your-domain')) {
    console.log('\n⚠️  PERINGATAN: Anda belum mengganti SERVER_URL!');
    console.log('   Edit file ini dan ganti SERVER_URL dengan URL server online Anda.');
    console.log('   Contoh: https://siad-tik-polda.vercel.app');
    console.log('   atau: https://siad-tik-polda.railway.app');
    return;
  }

  const credentials = {
    username: 'superadmin',
    password: 'admin123',
  };

  console.log('\n📝 Testing with credentials:');
  console.log('   Username:', credentials.username);
  console.log('   Password:', credentials.password);
  
  const loginUrl = `${SERVER_URL}/api/auth/login`;
  console.log('\n🎯 Login URL:', loginUrl);
  
  try {
    console.log('\n📡 Sending POST request...');
    const startTime = Date.now();
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`\n⏱️  Response time: ${duration}ms`);
    console.log('='.repeat(70));
    console.log('📊 RESPONSE DETAILS');
    console.log('='.repeat(70));
    
    // Status
    console.log('\n1️⃣  STATUS CODE:', response.status, response.statusText);
    
    if (response.status === 204) {
      console.log('   ✅ Status 204 - Login berhasil!');
    } else if (response.status === 401) {
      console.log('   ❌ Status 401 - Username atau password salah');
    } else if (response.status === 500) {
      console.log('   ❌ Status 500 - Server error (cek logs server)');
    } else {
      console.log('   ⚠️  Unexpected status code');
    }
    
    // Headers
    console.log('\n2️⃣  RESPONSE HEADERS:');
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
      console.log(`   ${key}: ${value}`);
    });
    
    // Check Set-Cookie
    console.log('\n3️⃣  COOKIE CHECK:');
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      console.log('   ✅ Set-Cookie header ADA');
      console.log('   Cookie:', setCookie);
      
      // Parse cookie details
      if (setCookie.includes('token=')) {
        console.log('   ✅ Token cookie found');
      }
      if (setCookie.includes('HttpOnly')) {
        console.log('   ✅ HttpOnly flag: YES');
      }
      if (setCookie.includes('Secure')) {
        console.log('   ✅ Secure flag: YES');
      }
      if (setCookie.includes('SameSite')) {
        const sameSiteMatch = setCookie.match(/SameSite=(\w+)/);
        if (sameSiteMatch) {
          console.log(`   ✅ SameSite: ${sameSiteMatch[1]}`);
        }
      }
    } else {
      console.log('   ❌ Set-Cookie header TIDAK ADA!');
      console.log('   💡 Ini masalah utama - cookie tidak di-set oleh server');
    }
    
    // Body
    console.log('\n4️⃣  RESPONSE BODY:');
    const contentType = response.headers.get('content-type');
    
    if (response.status === 204) {
      console.log('   ✅ No content (expected untuk 204)');
    } else {
      try {
        const text = await response.text();
        if (text) {
          console.log('   Body:', text);
          try {
            const json = JSON.parse(text);
            console.log('   JSON:', JSON.stringify(json, null, 2));
          } catch (e) {
            // Not JSON
          }
        } else {
          console.log('   (empty)');
        }
      } catch (e) {
        console.log('   Error reading body:', e.message);
      }
    }
    
    // Kesimpulan
    console.log('\n' + '='.repeat(70));
    console.log('📊 KESIMPULAN');
    console.log('='.repeat(70));
    
    const checks = {
      'Status 204': response.status === 204,
      'Set-Cookie header ada': !!setCookie,
      'Token cookie ada': setCookie?.includes('token='),
      'HttpOnly flag': setCookie?.includes('HttpOnly'),
      'Secure flag': setCookie?.includes('Secure'),
    };
    
    let allPassed = true;
    Object.entries(checks).forEach(([check, passed]) => {
      const icon = passed ? '✅' : '❌';
      console.log(`${icon} ${check}`);
      if (!passed) allPassed = false;
    });
    
    console.log('\n' + '='.repeat(70));
    
    if (allPassed) {
      console.log('\n🎉 SEMUA CHECKS PASSED - LOGIN BERHASIL!');
      console.log('\n✅ Server online berfungsi dengan baik.');
      console.log('✅ Credentials valid.');
      console.log('✅ Cookie di-set dengan benar.');
      console.log('\n💡 Jika masih tidak bisa login via browser:');
      console.log('   1. Clear browser cache & cookies');
      console.log('   2. Try incognito/private mode');
      console.log('   3. Cek browser console untuk error JavaScript');
      console.log('   4. Disable browser extensions yang might interfere');
    } else {
      console.log('\n❌ ADA MASALAH YANG PERLU DIPERBAIKI!');
      console.log('\n💡 Troubleshooting:');
      
      if (response.status !== 204) {
        console.log('\n   Status bukan 204:');
        if (response.status === 500) {
          console.log('   - Cek server logs untuk error detail');
          console.log('   - Pastikan DATABASE_URL dan JWT_SECRET di-set di server');
          console.log('   - Pastikan Prisma Client ter-generate');
        } else if (response.status === 401) {
          console.log('   - Credentials mungkin berbeda di server');
          console.log('   - Database mungkin berbeda antara local dan production');
        }
      }
      
      if (!setCookie) {
        console.log('\n   Cookie tidak di-set:');
        console.log('   - Cek file src/app/api/auth/login/route.ts sudah ter-deploy');
        console.log('   - Pastikan HTTPS enabled');
        console.log('   - Cek server logs untuk error saat set cookie');
      }
    }
    
    console.log('\n' + '='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ FETCH ERROR:', error);
    console.error('Message:', error.message);
    
    console.log('\n💡 Possible causes:');
    console.log('   - Server tidak accessible (cek URL)');
    console.log('   - CORS policy blocking request');
    console.log('   - Network error');
    console.log('   - Server down/not responding');
    
    console.log('\n💡 Try:');
    console.log('   1. Cek apakah server URL benar');
    console.log('   2. Buka URL di browser untuk verify server running');
    console.log('   3. Test dengan curl:');
    console.log(`      curl -X POST ${loginUrl} \\`);
    console.log('        -H "Content-Type: application/json" \\');
    console.log(`        -d '${JSON.stringify(credentials)}' \\`);
    console.log('        -v');
  }
}

// Run test
testOnlineLogin();
