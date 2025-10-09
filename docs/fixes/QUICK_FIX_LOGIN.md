# 🚨 QUICK FIX: Login Superadmin Tidak Bisa di Server Online

## ⚡ TL;DR - Quick Solution

**Masalah:** Login superadmin gagal di production server  
**Root Cause:** Cookie settings tidak compatible dengan HTTPS  
**Status:** ✅ SUDAH DIPERBAIKI

## 🔧 Quick Fix Checklist

### 1. Verify File Sudah Updated
```bash
# File yang harus sudah berubah:
# src/app/api/auth/login/route.ts
# - Line 65-67: isProduction detection
# - Line 73: sameSite: isProduction ? "lax" : "strict"
```

### 2. Set Environment Variables di Hosting

**Untuk Vercel:**
```bash
vercel env add DATABASE_URL production
# Paste: postgres://d90c1404b1821eda9c68c82a73f0533fa2a91fa7c59c25999513e9585d1114fd:sk_qBf5wJe9Yd4Ct1cPMGm8c@db.prisma.io:5432/postgres?sslmode=require

vercel env add JWT_SECRET production
# Paste: INI_ADALAH_KUNCI_RAHASIA_SUPER_AMAN_DAN_PANJANG
```

**Untuk Railway:**
- Buka dashboard > Variables
- Add: DATABASE_URL dan JWT_SECRET

### 3. Deploy
```bash
# Vercel
vercel --prod

# Railway
railway up

# Or push to GitHub (if auto-deploy enabled)
git add .
git commit -m "Fix: Cookie settings for production"
git push origin main
```

### 4. Test Login
```bash
# Via curl
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}' \
  -v

# Expected: HTTP/2 204 + Set-Cookie header
```

## 🔍 Still Not Working?

### Run Diagnostics:
```bash
# Check database & credentials
npx ts-node diagnose-online-login.ts

# Check production setup
npx ts-node test-production-setup.ts

# Check SUPERADMIN account
npx ts-node check-superadmin.ts
```

### Common Issues:

**❌ Error 500**
- Cek JWT_SECRET di environment variables
- Cek server logs: `vercel logs --follow`

**❌ Cookie tidak ter-set**
- Cek HTTPS enabled
- Cek response headers di Network tab

**❌ Database error**
- Add connection pooling: `?connection_limit=5&pool_timeout=20`

## 📋 Login Credentials

```
Username: superadmin
Password: admin123
```

⚠️ **SEGERA GANTI SETELAH LOGIN PERTAMA!**

## 📞 Need More Help?

1. Baca: [SOLUSI_LOGIN_ONLINE.md](./SOLUSI_LOGIN_ONLINE.md)
2. Baca: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
3. Run diagnostics (lihat di atas)
4. Check browser console & server logs

---

**Last Updated:** 7 Oktober 2025
