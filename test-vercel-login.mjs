// Test login ke server Vercel Anda
const SERVER_URL = 'https://siap-tik-polda.vercel.app';

async function testVercelLogin() {
  console.log('🌐 TESTING LOGIN KE VERCEL SERVER');
  console.log('='.repeat(70));
  console.log('Server URL:', SERVER_URL);
  console.log('Timestamp:', new Date().toLocaleString('id-ID'));
  console.log('='.repeat(70));

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
      console.log('   ✅ Status 204 - Login API berhasil!');
    } else if (response.status === 401) {
      console.log('   ❌ Status 401 - Username atau password salah');
    } else if (response.status === 500) {
      console.log('   ❌ Status 500 - Server error (cek logs)');
    } else if (response.status === 200) {
      console.log('   ⚠️  Status 200 - Unexpected (seharusnya 204)');
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
      console.log('   💡 Cookie mungkin di-set tapi tidak visible dari fetch API');
      console.log('   💡 Ini normal untuk cross-origin requests');
    }
    
    // Body
    console.log('\n4️⃣  RESPONSE BODY:');
    
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
    
    if (response.status === 204) {
      console.log('\n🎉 LOGIN API BERHASIL!');
      console.log('\n✅ Server merespons dengan benar');
      console.log('✅ Credentials valid');
      console.log('✅ Token seharusnya sudah di-set (cek di browser)');
      console.log('\n💡 Jika masih redirect ke /login setelah login:');
      console.log('   1. Cek di browser DevTools > Application > Cookies');
      console.log('      - Apakah ada cookie "token"?');
      console.log('   2. Cek di browser DevTools > Network tab:');
      console.log('      - Klik request /api/auth/login');
      console.log('      - Lihat Response Headers');
      console.log('      - Cari "set-cookie" header');
      console.log('   3. Cek Console tab untuk error JavaScript');
      console.log('   4. Clear browser cache & cookies, try again');
    } else {
      console.log('\n❌ LOGIN GAGAL');
      console.log(`   Status: ${response.status} ${response.statusText}`);
    }
    
    console.log('\n' + '='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ FETCH ERROR:', error);
    console.error('Message:', error.message);
  }
}

// Run test
testVercelLogin();
