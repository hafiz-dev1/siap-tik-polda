# 🔥 Debugging Login SUPER_ADMIN - Langkah Demi Langkah

## ⚠️ ERROR YANG TERLIHAT
Dari screenshot: "Terjadi kesalahan pada server" (muncul 2x)

## 🎯 LANGKAH DEBUGGING

### Step 1: Pastikan Server Berjalan
```powershell
# Stop server yang lama (tekan Ctrl+C di terminal npm run dev)
# Kemudian restart:
npm run dev
```

Tunggu sampai muncul:
```
✓ Ready in ...
- Local: http://localhost:3000
```

### Step 2: Buka Browser Developer Console
1. Buka Chrome/Edge
2. Tekan F12 untuk buka Developer Tools
3. Ke tab "Console"
4. Ke tab "Network"

### Step 3: Coba Login
1. Buka `http://localhost:3000/login`
2. Masukkan:
   - Username: `superadmin`
   - Password: `admin123`
3. Klik "Masuk ke Dashboard"

### Step 4: Check Error di Browser Console
Di tab Console, lihat apakah ada error JavaScript.
Screenshot atau copy error yang muncul.

### Step 5: Check Network Tab
Di tab Network:
1. Cari request ke `/api/auth/login`
2. Klik request tersebut
3. Lihat:
   - Status Code (harusnya 204 jika sukses, atau 500 jika error)
   - Response tab (lihat error message)
   - Headers tab (lihat apakah cookie di-set)

### Step 6: Check Terminal Server
**INI YANG PALING PENTING!**

Lihat terminal tempat `npm run dev` berjalan.
Cari error log yang muncul saat Anda klik "Masuk ke Dashboard".

Dengan logging yang sudah saya tambahkan, Anda akan melihat:
```
🔐 Login attempt started
📝 Username: superadmin
🔍 Searching for user in database...
✅ User found: { id: '...', role: 'SUPER_ADMIN', deletedAt: null }
🔑 Verifying password...
🔑 Password valid: true
🎫 Checking JWT_SECRET...
✅ JWT_SECRET exists
🎫 Creating JWT token...
✅ Token created
✅ Login successful for user: superadmin
```

ATAU error log seperti:
```
❌❌❌ Login error: [error detail]
```

## 🐛 KEMUNGKINAN MASALAH

### Masalah 1: Prisma Client Error
**Solusi:**
```powershell
npx prisma generate
```

### Masalah 2: Database Connection Error
**Cek:**
- Apakah database online?
- Apakah DATABASE_URL di .env benar?

**Test koneksi:**
```powershell
npx prisma db execute --sql "SELECT 1"
```

### Masalah 3: JWT_SECRET Undefined
**Cek:**
```powershell
# Restart server setelah cek .env
npm run dev
```

### Masalah 4: Import Error (bcryptjs atau jsonwebtoken)
**Solusi:**
```powershell
npm install bcryptjs jsonwebtoken jose
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

## 📋 YANG HARUS ANDA LAKUKAN SEKARANG:

1. ✅ Restart server (`npm run dev`)
2. ✅ Buka browser dengan F12 (Developer Tools)
3. ✅ Login dengan superadmin/admin123
4. ✅ **SCREENSHOT atau COPY error yang muncul di:**
   - Browser Console
   - Browser Network tab (response dari /api/auth/login)
   - **Terminal server (PALING PENTING!)**

5. ✅ Kirim error log tersebut ke saya

## 🔍 APA YANG SUDAH KITA VERIFIKASI:

- ✅ User superadmin EXISTS di database
- ✅ Password admin123 VALID
- ✅ User TIDAK soft-deleted (deletedAt: null)
- ✅ JWT_SECRET EXISTS di .env
- ✅ Prisma client GENERATED
- ✅ Login route UPDATED dengan logging detail

## ❓ APA YANG BELUM KITA TAU:

- ❓ Error SPESIFIK apa yang muncul di server terminal saat login
- ❓ Apakah request sampai ke API route atau stuck di middleware
- ❓ Apakah ada JavaScript error di browser

**TOLONG COBA LANGKAH DI ATAS DAN KIRIM ERROR LOG KE SAYA!** 🙏
