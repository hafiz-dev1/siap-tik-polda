# 🔥 DIAGNOSIS: Error 500 di Vercel

## Status: ERROR 500 - Internal Server Error

**Test Result:**
```
❌ Status: 500 Internal Server Error
❌ Response: {"error":"Terjadi kesalahan pada server"}
❌ Cookie tidak di-set
```

---

## 🎯 MASALAH DITEMUKAN!

Server Vercel **merespons tapi dengan error 500**. Ini berarti:
- ✅ Server berjalan
- ✅ Endpoint accessible
- ❌ Ada error di server-side code

---

## 🔍 KEMUNGKINAN PENYEBAB

### 1. Environment Variables Tidak Di-set (Paling Mungkin!)

**Check:**
```bash
vercel env ls
```

**Yang harus ada:**
- `DATABASE_URL`
- `JWT_SECRET`

**Jika tidak ada, tambahkan:**
```bash
vercel env add DATABASE_URL production
# Paste: postgres://d90c1404b1821eda9c68c82a73f0533fa2a91fa7c59c25999513e9585d1114fd:sk_qBf5wJe9Yd4Ct1cPMGm8c@db.prisma.io:5432/postgres?sslmode=require

vercel env add JWT_SECRET production
# Paste: INI_ADALAH_KUNCI_RAHASIA_SUPER_AMAN_DAN_PANJANG

# Redeploy
vercel --prod
```

### 2. Prisma Client Tidak Ter-generate

**Check package.json:**
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

**Jika tidak ada, tambahkan dan commit:**
```bash
# Edit package.json
git add package.json
git commit -m "Fix: Add prisma generate to build scripts"
git push origin main
```

### 3. Database Connection Error

Kemungkinan firewall atau connection limit.

---

## 🚨 LANGKAH SEGERA

### Step 1: Cek Vercel Logs (PENTING!)

```bash
# Login
vercel login

# Link project (jika belum)
vercel link

# Lihat logs real-time
vercel logs --follow
```

**Atau via dashboard:**
1. Buka https://vercel.com/dashboard
2. Pilih project: siap-tik-polda
3. Go to: Deployments > Latest deployment
4. Klik "View Function Logs"

**Cari error seperti:**
```
❌ JWT_SECRET is not defined
❌ Prisma Client not found
❌ Database connection error
```

### Step 2: Cek Environment Variables

**Via CLI:**
```bash
vercel env ls

# Output harus ada:
# DATABASE_URL (Production)
# JWT_SECRET (Production)
```

**Via Dashboard:**
1. https://vercel.com/dashboard
2. Project: siap-tik-polda
3. Settings > Environment Variables
4. Pastikan ada DATABASE_URL dan JWT_SECRET

### Step 3: Redeploy

Setelah set environment variables:
```bash
vercel --prod --force
```

---

## 📋 CHECKLIST

- [ ] Vercel logs sudah dicek?
- [ ] Error message dari logs sudah dicatat?
- [ ] Environment variables sudah di-set?
  - [ ] DATABASE_URL
  - [ ] JWT_SECRET
- [ ] package.json punya prisma generate di build script?
- [ ] Sudah redeploy setelah update?

---

## 💡 EXPECTED ERROR MESSAGE

Dari code login route, error 500 kemungkinan dari:

1. **JWT_SECRET tidak ada:**
   ```
   ❌ JWT_SECRET is not defined!
   Error: Konfigurasi server tidak lengkap
   ```

2. **Database error:**
   ```
   ❌ Database connection error
   Can't reach database server
   ```

3. **Prisma Client error:**
   ```
   ❌ @prisma/client did not initialize yet
   ```

---

## 🎯 NEXT STEPS

1. **Jalankan:** `vercel logs --follow`
2. **Login di browser** ke https://siap-tik-polda.vercel.app/login
3. **Coba login** dengan superadmin/admin123
4. **Lihat error** yang muncul di Vercel logs
5. **Share error message** tersebut ke sini

Dengan error message dari logs, saya bisa kasih solusi yang **sangat spesifik**! 🎯

---

**Created:** 7 Oktober 2025, 22:23
