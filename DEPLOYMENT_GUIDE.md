# 🚀 Panduan Deploy SIAD TIK POLDA ke Production

## 📋 Table of Contents
1. [Pre-deployment Checklist](#pre-deployment-checklist)
2. [Vercel Deployment](#vercel-deployment)
3. [Railway Deployment](#railway-deployment)
4. [VPS/Server Manual](#vpsserver-manual)
5. [Troubleshooting](#troubleshooting)

---

## Pre-deployment Checklist

Sebelum deploy, pastikan:

```bash
# 1. Test production setup locally
npm run build
npm start

# 2. Test database connection
npx ts-node test-production-setup.ts

# 3. Verify SUPERADMIN account
npx ts-node check-superadmin.ts

# 4. Update package.json scripts
```

Pastikan `package.json` memiliki scripts berikut:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "postinstall": "prisma generate",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy"
  }
}
```

---

## Vercel Deployment

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login ke Vercel

```bash
vercel login
```

### Step 3: Set Environment Variables

**Opsi A: Via CLI**

```bash
# Set DATABASE_URL
vercel env add DATABASE_URL production
# Paste: postgres://d90c1404b1821eda9c68c82a73f0533fa2a91fa7c59c25999513e9585d1114fd:sk_qBf5wJe9Yd4Ct1cPMGm8c@db.prisma.io:5432/postgres?sslmode=require

# Set JWT_SECRET
vercel env add JWT_SECRET production
# Paste: INI_ADALAH_KUNCI_RAHASIA_SUPER_AMAN_DAN_PANJANG
```

**Opsi B: Via Dashboard**

1. Buka https://vercel.com/dashboard
2. Pilih project Anda
3. Go to: Settings > Environment Variables
4. Add:
   - `DATABASE_URL` = `postgres://...`
   - `JWT_SECRET` = `your-secret-key`

### Step 4: Deploy

```bash
# Deploy ke production
vercel --prod

# Atau push ke GitHub (jika sudah setup auto-deploy)
git push origin main
```

### Step 5: Verify Deployment

```bash
# Check logs
vercel logs --follow

# Test login endpoint
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}' \
  -v
```

### Vercel Troubleshooting

**Error: "Prisma Client not found"**
```bash
# Pastikan postinstall script ada
# Redeploy dengan:
vercel --force --prod
```

**Error: "Database connection timeout"**
```bash
# Enable connection pooling di DATABASE_URL:
DATABASE_URL="postgres://...?connection_limit=5&pool_timeout=20"
```

**Error: "Cookie not set"**
- Cek browser Network tab
- Pastikan response header ada `Set-Cookie`
- Cek file login/route.ts sudah update (sameSite: lax)

---

## Railway Deployment

### Step 1: Install Railway CLI

```bash
npm i -g @railway/cli
```

### Step 2: Login ke Railway

```bash
railway login
```

### Step 3: Initialize Project

```bash
# Di folder project
railway init
```

### Step 4: Set Environment Variables

**Opsi A: Via CLI**

```bash
railway variables set DATABASE_URL="postgres://d90c1404b1821eda9c68c82a73f0533fa2a91fa7c59c25999513e9585d1114fd:sk_qBf5wJe9Yd4Ct1cPMGm8c@db.prisma.io:5432/postgres?sslmode=require"

railway variables set JWT_SECRET="INI_ADALAH_KUNCI_RAHASIA_SUPER_AMAN_DAN_PANJANG"
```

**Opsi B: Via Dashboard**

1. Buka https://railway.app/dashboard
2. Pilih project Anda
3. Go to: Variables tab
4. Add:
   - `DATABASE_URL`
   - `JWT_SECRET`

### Step 5: Deploy

```bash
# Deploy
railway up

# Atau connect ke GitHub dan auto-deploy
railway link
git push origin main
```

### Step 6: Get Deployment URL

```bash
railway domain
```

### Railway Troubleshooting

**Error: "Build failed"**
```bash
# Cek build logs
railway logs

# Force rebuild
railway up --force
```

**Error: "Port already in use"**
- Railway otomatis set PORT env variable
- Next.js otomatis detect PORT dari environment

---

## VPS/Server Manual Deployment

### Prerequisites

- Ubuntu 20.04+ atau Debian 11+
- Node.js 18+ installed
- PostgreSQL 14+ (atau gunakan Prisma Data Platform)
- Nginx (optional, untuk reverse proxy)

### Step 1: Setup Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (optional)
sudo apt install -y nginx
```

### Step 2: Clone & Setup Project

```bash
# Clone repository
git clone https://github.com/your-username/siad-tik-polda.git
cd siad-tik-polda

# Install dependencies
npm install

# Create .env file
nano .env
```

Paste ke `.env`:
```env
DATABASE_URL="postgres://d90c1404b1821eda9c68c82a73f0533fa2a91fa7c59c25999513e9585d1114fd:sk_qBf5wJe9Yd4Ct1cPMGm8c@db.prisma.io:5432/postgres?sslmode=require"
JWT_SECRET="INI_ADALAH_KUNCI_RAHASIA_SUPER_AMAN_DAN_PANJANG"
NODE_ENV="production"
```

### Step 3: Build & Start

```bash
# Generate Prisma Client
npx prisma generate

# Build Next.js
npm run build

# Start with PM2
pm2 start npm --name "siad-tik" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Copy-paste command yang muncul
```

### Step 4: Setup Nginx (Optional)

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/siad-tik
```

Paste:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/siad-tik /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: Setup SSL (Optional)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### VPS Management Commands

```bash
# View logs
pm2 logs siad-tik

# Restart app
pm2 restart siad-tik

# Stop app
pm2 stop siad-tik

# Monitor
pm2 monit

# Update app
cd /path/to/siad-tik-polda
git pull
npm install
npm run build
pm2 restart siad-tik
```

---

## Troubleshooting

### Problem: Login works on localhost but not on production

**Diagnosis:**
```bash
# 1. Check environment variables
npx ts-node test-production-setup.ts

# 2. Check server logs
# Vercel: vercel logs --follow
# Railway: railway logs
# VPS: pm2 logs siad-tik

# 3. Test endpoint
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"admin123"}' \
  -v
```

**Common Causes:**

1. **Environment variables not set**
   - Solution: Set DATABASE_URL and JWT_SECRET di dashboard

2. **Cookie not being set (HTTPS issue)**
   - Solution: File login/route.ts sudah diupdate dengan sameSite: lax

3. **Prisma Client not generated**
   - Solution: Add `postinstall: "prisma generate"` to package.json

4. **Database connection limit**
   - Solution: Add connection pooling to DATABASE_URL

### Problem: Error 500 - Internal Server Error

**Check:**
```bash
# 1. Server logs untuk error detail
# 2. Check JWT_SECRET exists
# 3. Check DATABASE_URL valid
# 4. Test database connection:
npx ts-node diagnose-online-login.ts
```

### Problem: "Prisma Client validation error"

**Solution:**
```bash
# Regenerate Prisma Client
npx prisma generate

# Redeploy
# Vercel: vercel --force --prod
# Railway: railway up --force
# VPS: pm2 restart siad-tik
```

### Problem: Database connection timeout

**Solution:**
```bash
# Add connection pooling
DATABASE_URL="postgres://...?connection_limit=5&pool_timeout=20&connect_timeout=10"

# Or use Prisma Accelerate (paid)
```

---

## Testing Checklist

Setelah deployment, test:

- [ ] ✅ Buka https://your-domain.com
- [ ] ✅ Halaman login muncul
- [ ] ✅ Login dengan superadmin / admin123
- [ ] ✅ Redirect ke /dashboard
- [ ] ✅ Menu "Manajemen User" muncul
- [ ] ✅ Bisa akses /admin/users
- [ ] ✅ Bisa CRUD surat
- [ ] ✅ Logout berhasil
- [ ] ✅ Token expired handling bekerja

---

## Security Recommendations

After deployment:

1. **Change Default Password**
   ```bash
   # Login as superadmin
   # Go to: Settings/Profile
   # Change password from admin123 to strong password
   ```

2. **Rotate JWT_SECRET**
   ```bash
   # Generate new secret
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   
   # Update di dashboard hosting
   # Redeploy
   ```

3. **Enable HTTPS**
   - Vercel/Railway: Auto HTTPS
   - VPS: Use Certbot (see above)

4. **Setup Database Backup**
   - Prisma Data Platform: Auto backup
   - Self-hosted: Setup cron job

5. **Monitor Errors**
   - Setup Sentry or similar
   - Monitor server logs regularly

---

## Support

Jika masih ada masalah:

1. 📸 Screenshot error dari browser console
2. 📋 Copy server logs
3. 🔍 Run diagnostic scripts:
   ```bash
   npx ts-node diagnose-online-login.ts
   npx ts-node test-production-setup.ts
   ```
4. 📧 Contact dengan info di atas

---

**Dibuat oleh:** GitHub Copilot  
**Tanggal:** 7 Oktober 2025  
**Versi:** 1.0
