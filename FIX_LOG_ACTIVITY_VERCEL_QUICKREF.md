# 🚀 QUICK FIX: Log Activity di Vercel

## ⚡ SOLUSI CEPAT (5 Menit)

### Step 1: Jalankan Migration di Database Production

```bash
# Ambil DATABASE_URL dari Vercel Dashboard
# Settings → Environment Variables → DATABASE_URL

# Windows PowerShell:
$env:DATABASE_URL_PRODUCTION = "postgresql://your-production-url-here"
psql $env:DATABASE_URL_PRODUCTION -f migrations/manual_add_activity_log.sql

# Linux/Mac:
export DATABASE_URL_PRODUCTION="postgresql://your-production-url-here"
psql $DATABASE_URL_PRODUCTION -f migrations/manual_add_activity_log.sql
```

### Step 2: Verify Migration Berhasil

```bash
# Check apakah tabel sudah ada
psql $env:DATABASE_URL_PRODUCTION -c "SELECT COUNT(*) FROM activity_log;"

# Atau gunakan debug script
npx tsx debug-log-activity-production.ts
```

### Step 3: Redeploy di Vercel

```bash
# Trigger redeploy (code sudah di-fix otomatis)
git add .
git commit -m "fix: improve activity log error handling for production"
git push

# Atau trigger manual di Vercel Dashboard:
# Deployments → ... → Redeploy
```

### Step 4: Test di Production

```bash
# 1. Test health check
curl https://your-app.vercel.app/api/health/activity-log

# 2. Buka browser
# https://your-app.vercel.app/log-activity

# 3. Test dengan login/logout
# Log seharusnya muncul
```

---

## 🔍 DIAGNOSIS CEPAT

### Cek Status Database Production:

```bash
# Run debug script
npx tsx debug-log-activity-production.ts
```

Expected output jika **SEHAT**:
```
✅ Database connected successfully
✅ Table "activity_log" exists
✅ All required columns present
✅ Can read! Total logs: X
✅ Can write! Test log created
✅ DIAGNOSIS COMPLETE - All checks passed!
```

Expected output jika **BERMASALAH**:
```
❌ Table "activity_log" NOT FOUND!
⚠️  You need to run the migration:
👉 psql $DATABASE_URL -f migrations/manual_add_activity_log.sql
```

---

## 🎯 APA YANG SUDAH DIPERBAIKI

### 1. ✅ Package.json - Build Process
**Before:**
```json
"build": "next build"
```

**After:**
```json
"build": "prisma generate && next build",
"postinstall": "prisma generate"
```

**Impact:** Prisma Client akan selalu di-generate dengan schema terbaru saat deploy

---

### 2. ✅ Error Logging - Activity Logger
**Before:**
```typescript
catch (error) {
  console.error('Failed to log activity:', error);
}
```

**After:**
```typescript
catch (error) {
  const errorDetails = {
    message: 'Failed to log activity',
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    category: params.category,
    type: params.type,
    userId: params.userId,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };
  
  console.error('🔴 ACTIVITY LOG ERROR:', JSON.stringify(errorDetails, null, 2));
}
```

**Impact:** Error sekarang lebih detail dan mudah di-debug di Vercel logs

---

### 3. ✅ Server Actions - Better Error Handling
**Before:**
```typescript
catch (error) {
  console.error('Error fetching activity logs:', error);
  return { error: 'Failed to fetch activity logs' };
}
```

**After:**
```typescript
catch (error) {
  const errorDetails = {
    message: 'Error fetching activity logs',
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    userId: session?.operatorId,
    timestamp: new Date().toISOString(),
  };
  console.error('🔴 ERROR fetching activity logs:', JSON.stringify(errorDetails, null, 2));
  
  return { 
    error: 'Failed to fetch activity logs',
    details: process.env.NODE_ENV === 'development' ? String(error) : undefined
  };
}
```

**Impact:** Dapat melihat error detail di development mode

---

### 4. ✅ Health Check Endpoint (NEW)
**File:** `src/app/api/health/activity-log/route.ts`

**Usage:**
```bash
curl https://your-app.vercel.app/api/health/activity-log
```

**Response:**
```json
{
  "status": "healthy",
  "checks": {
    "tableExists": true,
    "canRead": true,
    "canWrite": true,
    "totalLogs": 150,
    "columns": [...]
  },
  "timestamp": "2025-10-09T10:00:00Z",
  "responseTime": 234
}
```

**Impact:** Dapat dengan cepat check status activity log di production

---

### 5. ✅ Debug Script (NEW)
**File:** `debug-log-activity-production.ts`

**Usage:**
```bash
npx tsx debug-log-activity-production.ts
```

**Impact:** Comprehensive diagnosis untuk troubleshooting

---

## 🚨 TROUBLESHOOTING

### Problem: "Table activity_log does not exist"

**Solution:**
```bash
# Jalankan migration
psql $env:DATABASE_URL_PRODUCTION -f migrations/manual_add_activity_log.sql
```

---

### Problem: "Column XYZ does not exist"

**Solution:**
```bash
# Drop dan recreate table (HATI-HATI: akan hapus data!)
psql $env:DATABASE_URL_PRODUCTION -c "DROP TABLE IF EXISTS activity_log CASCADE;"
psql $env:DATABASE_URL_PRODUCTION -f migrations/manual_add_activity_log.sql

# Atau jalankan alter migration jika ada
psql $env:DATABASE_URL_PRODUCTION -f migrations/alter_activity_log.sql
```

---

### Problem: "Prisma Client tidak match dengan database schema"

**Solution:**
```bash
# Regenerate Prisma Client dengan production DB
DATABASE_URL="your-production-url" npx prisma generate

# Lalu redeploy
git commit --allow-empty -m "regenerate prisma client"
git push
```

---

### Problem: Health check menunjukkan "unhealthy"

**Check Vercel Logs:**
```
1. Buka Vercel Dashboard
2. Klik project Anda
3. Deployments → Latest
4. View Function Logs
5. Cari error log dengan emoji 🔴
```

**Common Errors:**
- `PrismaClientInitializationError` → Database connection issue
- `Table not found` → Migration belum dijalankan
- `Column not found` → Schema mismatch
- `Timeout` → Database connection pool habis

---

## 📊 VERIFICATION CHECKLIST

### Pre-Deploy:
- [ ] Migration file ready: `migrations/manual_add_activity_log.sql`
- [ ] Database URL production tersedia
- [ ] Run migration di production DB
- [ ] Verify dengan debug script

### Post-Deploy:
- [ ] Health check returns `"status": "healthy"`
- [ ] Page `/log-activity` loads tanpa error
- [ ] Test login → log tercatat
- [ ] Test logout → log tercatat
- [ ] Filters berfungsi
- [ ] Export CSV berfungsi
- [ ] Pagination berfungsi

---

## 🎓 CARA MENGAKSES DATABASE PRODUCTION

### Vercel Postgres:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Get environment variables
vercel env pull

# Sekarang DATABASE_URL ada di .env
```

### Prisma Data Platform:
```bash
# Check di dashboard: https://cloud.prisma.io/
# Copy DATABASE_URL
```

### Railway/Render/Supabase:
```bash
# Check di dashboard masing-masing
# Settings → Database → Connection String
```

---

## 📞 NEED HELP?

### Check Logs di Vercel:
```
Dashboard → Deployments → Latest → View Function Logs
```

### Check Database:
```bash
npx tsx debug-log-activity-production.ts
```

### Check Health:
```bash
curl https://your-app.vercel.app/api/health/activity-log | jq
```

---

## ✅ EXPECTED RESULT

### Before Fix:
- ❌ /log-activity → Blank/kosong
- ❌ Health check → unhealthy
- ❌ Logs tidak tercatat

### After Fix:
- ✅ /log-activity → Menampilkan data
- ✅ Health check → healthy
- ✅ Logs tercatat dengan benar
- ✅ Real-time updates berfungsi
- ✅ Export CSV berfungsi

---

## 🚀 NEXT STEPS

1. **Run debug script untuk confirm masalah:**
   ```bash
   npx tsx debug-log-activity-production.ts
   ```

2. **Jika tabel tidak ada, run migration:**
   ```bash
   psql $env:DATABASE_URL_PRODUCTION -f migrations/manual_add_activity_log.sql
   ```

3. **Push code yang sudah di-fix:**
   ```bash
   git add .
   git commit -m "fix: improve activity log production compatibility"
   git push
   ```

4. **Test di production:**
   - Buka health check
   - Buka /log-activity
   - Test login/logout
   - Verify logs muncul

---

**Status:** ✅ Semua fix sudah diimplementasikan  
**Ready to deploy:** 🚀 YES

Mau langsung deploy sekarang? 😊
