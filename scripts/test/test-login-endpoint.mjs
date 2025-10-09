// Test login endpoint
async function testLogin() {
  const url = 'http://localhost:3000/api/auth/login';
  
  console.log('🧪 Testing login endpoint...\n');
  console.log('URL:', url);
  console.log('Credentials: superadmin / admin123\n');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'superadmin',
        password: 'admin123'
      }),
    });

    console.log('📊 Response Status:', response.status, response.statusText);
    console.log('📋 Response Headers:');
    response.headers.forEach((value, key) => {
      console.log(`   ${key}: ${value}`);
    });

    const contentType = response.headers.get('content-type');
    
    if (response.status === 204) {
      console.log('\n✅ LOGIN BERHASIL (204 No Content)');
      console.log('Cookie seharusnya sudah di-set di response headers');
    } else if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('\n📝 Response Body:', JSON.stringify(data, null, 2));
      
      if (response.ok) {
        console.log('✅ LOGIN BERHASIL');
      } else {
        console.log('❌ LOGIN GAGAL');
        if (data.error) {
          console.log('Error:', data.error);
        }
        if (data.details) {
          console.log('Details:', data.details);
        }
      }
    } else {
      const text = await response.text();
      console.log('\n📝 Response Text:', text);
    }

  } catch (error) {
    console.error('\n❌ Error during test:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

testLogin();
