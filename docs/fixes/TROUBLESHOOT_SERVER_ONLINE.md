# 🚨 TROUBLESHOOTING: Login Gagal di Server Online

## ✅ Status Database & Code

**HASIL DIAGNOSIS:**
```
✅ Database connection: OK
✅ SUPERADMIN account: AKTIF
✅ Password (admin123): VALID
✅ JWT_SECRET: ADA
✅ Login simulation: BERHASIL
✅ Code login route: SUDAH DIPERBAIKI
```

**KESIMPULAN:** Database dan code 100% benar! ✅

**MASALAH:** Ada di deployment/server configuration ❌

---

## 🔍 LANGKAH-LANGKAH DEBUG DI SERVER ONLINE

### STEP 1: Identifikasi Platform Hosting Anda

Anda deploy di mana? Pilih salah satu:
- [ ] Vercel
- [ ] Railway
- [ ] Netlify  
- [ ] VPS/Server sendiri
- [ ] Platform lain: __________

**Lanjutkan ke section sesuai platform Anda di bawah.**

---

## 🎯 VERCEL - Troubleshooting

### 1.1 Cek Environment Variables

```bash
# Login ke Vercel
vercel login

# List environment variables
vercel env ls

# Output harus menunjukkan:
# DATABASE_URL (Production)
# JWT_SECRET (Production)
```

**Jika tidak ada:**
```bash
# Add environment variables
vercel env add DATABASE_URL production
# Paste: postgres://d90c1404b1821eda9c68c82a73f0533fa2a91fa7c59c25999513e9585d1114fd:sk_qBf5wJe9Yd4Ct1cPMGm8c@db.prisma.io:5432/postgres?sslmode=require

vercel env add JWT_SECRET production
# Paste: INI_ADALAH_KUNCI_RAHASIA_SUPER_AMAN_DAN_PANJANG

# Redeploy
vercel --prod
```

### 1.2 Cek Build Logs

```bash
# Lihat logs deployment terakhir
vercel logs [deployment-url] --follow

# Cari error seperti:
# - "Prisma Client not found"
# - "JWT_SECRET is not defined"
# - Database connection errors
```

### 1.3 Cek Runtime Logs

```bash
# Saat Anda coba login, monitor logs real-time
vercel logs --follow

# Seharusnya muncul:
# 🔐 Login attempt started
# 📝 Username: superadmin
# ✅ User found: ...
# ✅ Login successful
```

**Jika ada error, catat error message-nya!**

### 1.4 Test API Endpoint Langsung

```bash
# Ganti YOUR-DOMAIN dengan domain Vercel Anda
curl -X POST https://YOUR-DOMAIN.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}' \
  -i

# Expected response:
# HTTP/2 204
# set-cookie: token=eyJ...; Path=/; HttpOnly; Secure; SameSite=Lax
```

---

## 🚂 RAILWAY - Troubleshooting

### 2.1 Cek Environment Variables

1. Buka https://railway.app/dashboard
2. Pilih project Anda
3. Go to **Variables** tab
4. Pastikan ada:
   - `DATABASE_URL`
   - `JWT_SECRET`

**Jika tidak ada, tambahkan:**
```
DATABASE_URL=postgres://d90c1404b1821eda9c68c82a73f0533fa2a91fa7c59c25999513e9585d1114fd:sk_qBf5wJe9Yd4Ct1cPMGm8c@db.prisma.io:5432/postgres?sslmode=require
JWT_SECRET=INI_ADALAH_KUNCI_RAHASIA_SUPER_AMAN_DAN_PANJANG
```

### 2.2 Cek Deployment Logs

```bash
# Via CLI
railway logs

# Atau di dashboard:
# Deployments > Latest > View Logs
```

### 2.3 Restart Deployment

```bash
# Force redeploy
railway up --force

# Atau di dashboard:
# Deployments > Redeploy
```

### 2.4 Test API Endpoint

```bash
# Ganti YOUR-DOMAIN dengan domain Railway Anda
curl -X POST https://YOUR-DOMAIN.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}' \
  -i
```

---

## 🖥️ VPS/SERVER - Troubleshooting

### 3.1 Cek .env File

```bash
# SSH ke server
ssh user@your-server.com

# Masuk ke folder project
cd /path/to/siad-tik-polda

# Cek .env file
cat .env

# Pastikan berisi:
# DATABASE_URL="postgres://..."
# JWT_SECRET="..."
```

### 3.2 Cek PM2 Logs

```bash
# Lihat logs aplikasi
pm2 logs siad-tik --lines 100

# Monitor real-time
pm2 logs siad-tik --follow
```

### 3.3 Restart Aplikasi

```bash
# Restart PM2 process
pm2 restart siad-tik

# Atau rebuild
cd /path/to/siad-tik-polda
npm run build
pm2 restart siad-tik
```

---

## 🌐 TEST DI BROWSER (SEMUA PLATFORM)

### 1. Buka Browser DevTools

1. Buka Chrome/Firefox
2. Tekan **F12** untuk buka DevTools
3. Go to **Network** tab
4. ✅ Centang **Preserve log**

### 2. Coba Login

1. Buka `https://your-domain.com/login`
2. Masukkan:
   - Username: `superadmin`
   - Password: `admin123`
3. Klik tombol login

### 3. Analisis Network Tab

Cari request ke `/api/auth/login`:

**✅ BERHASIL jika:**
```
Status: 204 No Content
Response Headers:
  set-cookie: token=eyJ...; Path=/; HttpOnly; Secure; SameSite=Lax
```

**❌ GAGAL jika:**

| Status | Kemungkinan Penyebab |
|--------|---------------------|
| 401 | Username/password salah (tapi ini tidak mungkin karena sudah diverifikasi) |
| 500 | Server error - cek logs untuk detail |
| 404 | Route tidak ditemukan - ada masalah di build |
| CORS error | Domain tidak match / security issue |

### 4. Cek Console Tab

Lihat apakah ada error JavaScript:
- React hydration errors
- CORS errors
- Cookie setting errors

### 5. Cek Application Tab

1. Go to **Application** > **Cookies**
2. Pilih domain Anda
3. Setelah login, seharusnya ada cookie bernama `token`

**Jika tidak ada cookie:**
- Cookie tidak ter-set oleh server
- Cek response headers di Network tab
- Pastikan `Set-Cookie` header ada

---

## 🔧 COMMON FIXES

### Fix 1: Environment Variables Tidak Ter-load

**Gejala:** Error 500, atau "JWT_SECRET not defined"

**Solusi:**
1. Pastikan env vars di-set di dashboard hosting
2. Redeploy aplikasi
3. Clear build cache
4. Restart server

### Fix 2: Prisma Client Tidak Ter-generate

**Gejala:** "Prisma Client not found" / import error

**Solusi:**
```bash
# Di package.json, pastikan ada:
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}

# Commit & redeploy
git add package.json
git commit -m "Fix: Add prisma generate to build"
git push origin main
```

### Fix 3: Cookie Tidak Ter-set (HTTPS Issue)

**Gejala:** Login berhasil tapi redirect ke login lagi

**Solusi:** Sudah diperbaiki di `login/route.ts` dengan `sameSite: "lax"`

Pastikan file sudah ter-deploy:
```bash
git status
git add src/app/api/auth/login/route.ts
git commit -m "Fix: Cookie settings for production"
git push origin main
```

### Fix 4: Database Connection Pool Exhausted

**Gejala:** Timeout errors, "Too many connections"

**Solusi:**
```bash
# Update DATABASE_URL dengan connection pooling
DATABASE_URL="postgres://d90c1404b1821eda9c68c82a73f0533fa2a91fa7c59c25999513e9585d1114fd:sk_qBf5wJe9Yd4Ct1cPMGm8c@db.prisma.io:5432/postgres?sslmode=require&connection_limit=5&pool_timeout=20"

# Set di dashboard hosting
# Redeploy
```

---

## 📸 INFO YANG DIBUTUHKAN UNTUK DEBUG

Jika masih error, kirim info berikut:

### 1. Platform Hosting
```
Platform: (Vercel/Railway/VPS/dll)
URL: https://...
```

### 2. Screenshot Browser DevTools
```
- Network tab (request ke /api/auth/login)
- Console tab (error messages)
- Application > Cookies
```

### 3. Server Logs
```bash
# Vercel
vercel logs --follow

# Railway
railway logs

# VPS
pm2 logs siad-tik --lines 50
```

### 4. Response dari Curl Test
```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}' \
  -v

# Copy-paste FULL output
```

### 5. Environment Variables Check
```
✅/❌ DATABASE_URL di-set di server?
✅/❌ JWT_SECRET di-set di server?
✅/❌ Server sudah restart setelah set env vars?
```

---

## 🎯 CHECKLIST DEPLOYMENT

Cek satu-persatu:

- [ ] ✅ Code terbaru sudah di-push ke Git
- [ ] ✅ Environment variables sudah di-set di hosting dashboard
  - [ ] DATABASE_URL
  - [ ] JWT_SECRET  
- [ ] ✅ Build berhasil tanpa error
- [ ] ✅ Prisma Client ter-generate (`prisma generate` di build script)
- [ ] ✅ Server sudah restart/redeploy
- [ ] ✅ HTTPS enabled
- [ ] ✅ Domain accessible
- [ ] ✅ `/login` page bisa dibuka
- [ ] ✅ Test curl menunjukkan 204 + Set-Cookie
- [ ] ✅ Browser Network tab menunjukkan cookie ter-set

---

## 💡 DEBUGGING TIPS

### Tip 1: Enable Verbose Logging Sementara

Edit `src/app/api/auth/login/route.ts`, tambahkan di awal:

```typescript
export async function POST(request: NextRequest) {
  try {
    console.log('🚨 FULL DEBUG - Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
      HAS_DATABASE_URL: !!process.env.DATABASE_URL,
      HAS_JWT_SECRET: !!process.env.JWT_SECRET,
      DATABASE_URL_START: process.env.DATABASE_URL?.substring(0, 30),
    });
    
    // ... rest of code
```

Deploy dan cek logs saat login.

### Tip 2: Test dengan User Lain

Buat user test via Prisma Studio:
```bash
npx prisma studio
```

Create user baru dengan password simple, test login dengan itu.

### Tip 3: Bypass Middleware Sementara

Untuk test apakah masalah di middleware atau login route:

Edit `src/middleware.ts`, tambahkan di awal:
```typescript
export async function middleware(request: NextRequest) {
  console.log('🚨 Middleware hit:', request.nextUrl.pathname);
  
  // ... rest of code
```

Cek logs untuk lihat flow request.

---

## ✅ NEXT ACTIONS

Silakan:

1. **Identifikasi platform hosting Anda**
2. **Follow troubleshooting steps untuk platform tersebut**
3. **Collect info yang diminta di section "Info yang Dibutuhkan"**
4. **Share hasil debugging:**
   - Screenshot Network tab
   - Server logs
   - Curl output
   - Platform name & URL

Dengan info tersebut saya bisa bantu lebih spesifik! 🎯

---

**Dibuat:** 7 Oktober 2025  
**Status:** Database & Code ✅ | Deployment ⏳
