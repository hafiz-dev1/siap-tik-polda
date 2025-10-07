# 🔍 Diagnosa Masalah Login SUPERADMIN di Server Online

## 📋 Tanggal: 7 Oktober 2025

## ✅ Hasil Diagnosis Database

Berdasarkan pemeriksaan terhadap database online:

```
✅ Database terkoneksi dengan sukses
✅ JWT_SECRET ada (47 karakter)
✅ Ditemukan 1 akun SUPERADMIN aktif
   - ID: b6511649-1f68-4559-892f-9b2614e2cf6e
   - Username: superadmin
   - Password: admin123 (VALID)
   - Status: AKTIF (tidak soft-deleted)
✅ Validasi login berhasil
```

**KESIMPULAN:** Database online sudah benar, semua persyaratan terpenuhi!

---

## 🔍 Kemungkinan Penyebab Masalah

Karena database sudah benar, masalah kemungkinan besar ada di:

### 1. ⚠️ Environment Variables di Server Online Tidak Ter-load

**Penyebab:**
- File `.env` tidak ter-deploy ke server
- Hosting platform tidak membaca `.env` file
- Environment variables harus di-set manual di dashboard hosting

**Gejala:**
- Login berhasil di localhost
- Login gagal di server online
- Error 500 atau "Konfigurasi server tidak lengkap"

**Solusi untuk berbagai platform:**

#### **Vercel / Netlify / Railway:**
```bash
# Set environment variables di dashboard:
DATABASE_URL="postgres://d90c1404b1821eda9c68c82a73f0533fa2a91fa7c59c25999513e9585d1114fd:sk_qBf5wJe9Yd4Ct1cPMGm8c@db.prisma.io:5432/postgres?sslmode=require"
JWT_SECRET="INI_ADALAH_KUNCI_RAHASIA_SUPER_AMAN_DAN_PANJANG"
```

#### **Vercel (via CLI):**
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
```

#### **Railway:**
```bash
# Di dashboard Railway > Variables
# Add: DATABASE_URL, JWT_SECRET
```

---

### 2. 🔄 Build Cache di Server

**Penyebab:**
- Server menggunakan build lama
- Environment variables baru tidak ter-apply

**Solusi:**
```bash
# Di dashboard hosting:
1. Clear build cache
2. Redeploy aplikasi
3. Restart server
```

---

### 3. 🗄️ Prisma Client Tidak Ter-generate dengan Benar

**Penyebab:**
- Prisma Client di-generate dengan DATABASE_URL yang berbeda
- Build process tidak menjalankan `prisma generate`

**Solusi:**
```bash
# Pastikan di package.json ada:
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

---

### 4. 🌐 CORS atau Cookie Settings

**Penyebab:**
- Cookie `httpOnly` tidak bisa di-set di HTTPS
- `secure` flag tidak sesuai

**Cek di:** `src/app/api/auth/login/route.ts`
```typescript
response.cookies.set("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development", // ✅ Ini sudah benar
  sameSite: "strict",
  maxAge: 60 * 60 * 24,
  path: "/",
});
```

**Possible fix jika server pakai proxy:**
```typescript
response.cookies.set("token", token, {
  httpOnly: true,
  secure: true, // Paksa true untuk production
  sameSite: "lax", // Ubah dari strict ke lax
  maxAge: 60 * 60 * 24,
  path: "/",
});
```

---

### 5. 🔒 Database Connection Limit

**Penyebab:**
- Prisma Data Platform free tier memiliki connection limit
- Terlalu banyak koneksi terbuka

**Solusi:**
```bash
# Enable connection pooling
# Tambahkan ke DATABASE_URL:
DATABASE_URL="postgres://...?connection_limit=5&pool_timeout=20"
```

Atau gunakan file `.env.connection-pool.example` yang sudah ada.

---

## 🎯 Langkah-langkah Debugging untuk Server Online

### Step 1: Cek Environment Variables di Server

**Untuk Vercel:**
```bash
# Lihat env variables
vercel env ls

# Atau cek di dashboard:
# https://vercel.com/[username]/[project]/settings/environment-variables
```

**Untuk Railway:**
```bash
# Di dashboard Railway > project > Variables
# Pastikan DATABASE_URL dan JWT_SECRET ada
```

### Step 2: Cek Server Logs

**Untuk Vercel:**
```bash
# Real-time logs
vercel logs [deployment-url] --follow

# Atau lihat di dashboard:
# https://vercel.com/[username]/[project]/deployments/[deployment-id]
```

**Untuk Railway:**
```bash
# Di dashboard Railway > Deployments > View Logs
```

### Step 3: Test Login Endpoint Langsung

```bash
# Test dengan curl
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}' \
  -v
```

**Expected Response:**
```
< HTTP/2 204 
< set-cookie: token=eyJ...; Path=/; HttpOnly; Secure; SameSite=Strict
```

### Step 4: Cek Browser Console

```
1. Buka https://your-domain.com/login
2. Buka DevTools (F12) > Network tab
3. Login dengan superadmin / admin123
4. Cek request ke /api/auth/login:
   - Status code harus 204
   - Response header harus ada Set-Cookie
   - Cek error di Console tab
```

### Step 5: Enable Debug Mode Sementara

Edit `src/app/api/auth/login/route.ts`:
```typescript
export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Login attempt - Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      HAS_JWT_SECRET: !!process.env.JWT_SECRET,
      HAS_DATABASE_URL: !!process.env.DATABASE_URL,
      DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 20),
    });
    
    // ... rest of code
```

---

## 🛠️ Quick Fix untuk Masalah Umum

### Fix 1: Update Cookie Settings untuk Production

Jika login gagal karena cookie tidak ter-set:

```typescript
// src/app/api/auth/login/route.ts
const isProduction = process.env.NODE_ENV === 'production' || 
                     process.env.VERCEL === '1';

response.cookies.set("token", token, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "lax" : "strict",
  maxAge: 60 * 60 * 24,
  path: "/",
  domain: isProduction ? undefined : 'localhost', // Auto-detect di production
});
```

### Fix 2: Prisma Connection Pooling

Buat file `.env.production`:
```bash
DATABASE_URL="postgres://d90c1404b1821eda9c68c82a73f0533fa2a91fa7c59c25999513e9585d1114fd:sk_qBf5wJe9Yd4Ct1cPMGm8c@db.prisma.io:5432/postgres?sslmode=require&connection_limit=5&pool_timeout=20"
JWT_SECRET="INI_ADALAH_KUNCI_RAHASIA_SUPER_AMAN_DAN_PANJANG"
```

### Fix 3: Prisma Client Initialization

Update `src/lib/prisma.ts` (jika ada):
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 📊 Checklist Deployment

Sebelum deploy, pastikan:

- [ ] ✅ Environment variables sudah di-set di dashboard hosting
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
- [ ] ✅ `package.json` scripts sudah benar:
  ```json
  {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
  ```
- [ ] ✅ File `.env` ada di `.gitignore` (jangan di-commit!)
- [ ] ✅ Server sudah restart setelah update env vars
- [ ] ✅ Build cache sudah di-clear
- [ ] ✅ Test login di browser dengan Network tab terbuka

---

## 🚀 Platform-Specific Guides

### Vercel Deployment

1. **Set Environment Variables:**
   ```bash
   vercel env add DATABASE_URL production
   # Paste: postgres://d90c1404b1821eda9c68c82a73f0533fa2a91fa7c59c25999513e9585d1114fd:sk_qBf5wJe9Yd4Ct1cPMGm8c@db.prisma.io:5432/postgres?sslmode=require
   
   vercel env add JWT_SECRET production
   # Paste: INI_ADALAH_KUNCI_RAHASIA_SUPER_AMAN_DAN_PANJANG
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Check logs:**
   ```bash
   vercel logs --follow
   ```

### Railway Deployment

1. **Set Variables di Dashboard:**
   - Go to: railway.app > Your Project > Variables
   - Add: `DATABASE_URL` dan `JWT_SECRET`

2. **Redeploy:**
   - Push ke GitHub, atau
   - Click "Redeploy" di dashboard

3. **Check logs:**
   - Dashboard > Deployments > View Logs

### VPS (Ubuntu/Debian)

1. **Create `.env` file:**
   ```bash
   nano .env
   # Paste environment variables
   ```

2. **Build & Start:**
   ```bash
   npm install
   npm run build
   pm2 start npm --name "siad-tik" -- start
   ```

3. **Check logs:**
   ```bash
   pm2 logs siad-tik
   ```

---

## 💡 Rekomendasi

### Segera:
1. ✅ Cek environment variables di dashboard hosting
2. ✅ Enable connection pooling untuk database
3. ✅ Test dengan curl untuk melihat response exact

### Jangka Panjang:
1. 📊 Setup monitoring (Sentry, LogRocket)
2. 🔒 Rotate JWT_SECRET secara berkala
3. 🗄️ Setup database backup otomatis
4. 📈 Monitor database connection usage

---

## 📞 Need Help?

Jika masih error setelah mengikuti panduan ini:

1. 📸 Screenshot error di browser console
2. 📋 Copy-paste server logs
3. 🔍 Cek response dari curl test
4. 📝 Share informasi hosting platform yang digunakan

---

**Dibuat oleh:** GitHub Copilot  
**Tanggal:** 7 Oktober 2025
