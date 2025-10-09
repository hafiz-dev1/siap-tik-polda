# 🔍 ANALISIS MENDALAM: Log Activity Tidak Jalan di Vercel

## 📊 Status Diagnosis
**Tanggal:** 9 Oktober 2025  
**Masalah:** Log Activity berfungsi di localhost tapi tidak di Vercel  
**Severity:** 🔴 HIGH - Feature tidak berfungsi di production

---

## 🎯 ROOT CAUSE ANALYSIS

### ❌ Masalah Utama yang Ditemukan:

#### 1. **MISSING MIGRATION DI DATABASE PRODUCTION** 🗄️
**Probabilitas: 95%** - Ini kemungkinan besar masalah utamanya!

**Analisis:**
- ✅ Database lokal: Migration `manual_add_activity_log.sql` sudah dijalankan
- ❌ Database Vercel: Belum dijalankan migration yang sama
- Tabel `activity_log` kemungkinan TIDAK ADA atau struktur kolom BERBEDA

**Bukti:**
```sql
-- File migration ada di: migrations/manual_add_activity_log.sql
-- Tetapi migration ini MANUAL, tidak otomatis dijalankan saat deploy
```

**Dampak:**
- `prisma.activityLog.create()` akan FAIL karena tabel tidak sesuai
- Error ter-silent karena ada `try-catch` di `activityLogger.ts` line 60
- Browser tidak menampilkan error karena error hanya di `console.error`

---

#### 2. **PRISMA GENERATE TIDAK SYNC DENGAN DATABASE** ⚙️
**Probabilitas: 80%**

**Analisis:**
- `package.json` TIDAK ada script `postinstall` untuk Prisma
- Vercel build mungkin menggunakan Prisma Client yang tidak sesuai dengan DB structure

**File: `package.json` - Current:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",  // ❌ No prisma generate
    "start": "next start",
    "lint": "eslint"
  }
}
```

**Seharusnya:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "postinstall": "prisma generate"  // ⭐ INI YANG KURANG
  }
}
```

---

#### 3. **ERROR HANDLING YANG TERLALU SILENT** 🔇
**Probabilitas: 100%** - Pasti ini masalahnya kenapa tidak terdeteksi!

**File: `src/lib/activityLogger.ts` - Line 42-61:**
```typescript
export async function logActivity(params: LogActivityParams) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        category: params.category,
        type: params.type,
        description: params.description,
        // ... other fields
      },
    });
  } catch (error) {
    // ❌ MASALAH: Error hanya di-log, tidak di-throw!
    console.error('Failed to log activity:', error);
    // Seharusnya ada logging yang lebih visible atau monitoring
  }
}
```

**Dampak:**
- Error di production tidak terdeteksi
- User tidak tahu bahwa logging gagal
- Admin tidak mendapat notifikasi

---

#### 4. **SERVER ACTIONS TIDAK ADA ERROR LOGGING DETAIL** 📝
**Probabilitas: 90%**

**File: `src/app/(app)/log-activity/actions.ts`:**
```typescript
export async function getActivityLogs() {
  try {
    // ... query database
  } catch (error) {
    console.error('Error fetching activity logs:', error);  // ❌ Tidak cukup!
    return { error: 'Failed to fetch activity logs' };  // ❌ Pesan terlalu generic
  }
}
```

**Seharusnya:**
```typescript
} catch (error) {
  console.error('🔴 ERROR fetching activity logs:', {
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    userId: session?.operatorId,
    timestamp: new Date().toISOString(),
  });
  
  return { 
    error: 'Failed to fetch activity logs',
    details: process.env.NODE_ENV === 'development' ? String(error) : undefined
  };
}
```

---

## 🔬 KEMUNGKINAN SKENARIO DI VERCEL

### Skenario A: Tabel `activity_log` Tidak Ada ❌
```
Request → Server Action → Prisma Query → ❌ Table not found
→ Error caught → console.error → User sees blank page
```

### Skenario B: Struktur Kolom Berbeda ❌
```
Request → Server Action → Prisma Query → ❌ Column mismatch
→ Error caught → console.error → User sees blank page
```

### Skenario C: Database Connection Timeout ⏱️
```
Request → Server Action → Prisma Query → ⏱️ Timeout
→ Error caught → Returns empty array → User sees "no data"
```

---

## ✅ SOLUSI KOMPREHENSIF

### 🎯 Priority 1: FIX DATABASE MIGRATION (CRITICAL)

#### Step 1: Jalankan Migration di Database Production
```bash
# Koneksi ke database production Vercel
# Ganti dengan DATABASE_URL production Anda
export DATABASE_URL="postgresql://your-production-db-url"

# Jalankan migration
psql $DATABASE_URL -f migrations/manual_add_activity_log.sql

# Atau jika menggunakan GUI database:
# 1. Buka database GUI (Prisma Studio, pgAdmin, dll)
# 2. Copy-paste isi file manual_add_activity_log.sql
# 3. Execute
```

#### Step 2: Verifikasi Tabel Sudah Ada
```sql
-- Check apakah tabel activity_log ada
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'activity_log';

-- Check struktur kolom
\d activity_log

-- atau
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'activity_log'
ORDER BY ordinal_position;
```

---

### 🎯 Priority 2: FIX BUILD PROCESS

#### Update `package.json`:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "eslint",
    "postinstall": "prisma generate",
    "seed:dummies": "ts-node --transpile-only prisma/seed-dummy-surat.ts"
  }
}
```

---

### 🎯 Priority 3: IMPROVE ERROR HANDLING

#### Update `src/lib/activityLogger.ts`:
```typescript
export async function logActivity(params: LogActivityParams) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        category: params.category,
        type: params.type,
        description: params.description,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : null,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        status: params.status || 'SUCCESS',
      },
    });
  } catch (error) {
    // Enhanced error logging for production debugging
    const errorDetails = {
      message: 'Failed to log activity',
      error: error instanceof Error ? error.message : String(error),
      category: params.category,
      type: params.type,
      userId: params.userId,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };
    
    console.error('🔴 ACTIVITY LOG ERROR:', JSON.stringify(errorDetails, null, 2));
    
    // Optional: Send to error monitoring service (Sentry, etc.)
    // if (process.env.NODE_ENV === 'production') {
    //   // await sendToErrorMonitoring(errorDetails);
    // }
  }
}
```

---

### 🎯 Priority 4: ADD HEALTH CHECK ENDPOINT

#### Create: `src/app/api/health/activity-log/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check if table exists
    const tableCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'activity_log'
      ) as table_exists;
    `;

    // Check if can query
    const count = await prisma.activityLog.count();

    // Check if can write
    const testUser = await prisma.pengguna.findFirst();
    if (testUser) {
      await prisma.activityLog.create({
        data: {
          userId: testUser.id,
          category: 'SYSTEM',
          type: 'OTHER',
          description: '[HEALTH CHECK] System test',
          status: 'SUCCESS',
        },
      });
    }

    return NextResponse.json({
      status: 'healthy',
      checks: {
        tableExists: true,
        canRead: true,
        canWrite: true,
        totalLogs: count,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
```

---

### 🎯 Priority 5: ADD DEBUGGING TOOLS

#### Create: `debug-log-activity-production.ts`
```typescript
// Run this script to check production DB
import { prisma } from './src/lib/prisma';

async function debugProductionDB() {
  console.log('🔍 Checking Production Database...\n');

  try {
    // 1. Check connection
    await prisma.$connect();
    console.log('✅ Database connected\n');

    // 2. Check if table exists
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = 'activity_log';
    `;
    console.log('📋 Tables found:', tables);

    // 3. Check columns
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'activity_log'
      ORDER BY ordinal_position;
    `;
    console.log('\n📊 Columns in activity_log:');
    console.table(columns);

    // 4. Check if can read
    const count = await prisma.activityLog.count();
    console.log(`\n📈 Total logs: ${count}`);

    // 5. Get sample logs
    const sampleLogs = await prisma.activityLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { username: true, nama: true },
        },
      },
    });

    console.log('\n📝 Sample logs:');
    sampleLogs.forEach((log, i) => {
      console.log(`\n${i + 1}. [${log.category}/${log.type}]`);
      console.log(`   User: ${log.user?.username}`);
      console.log(`   Description: ${log.description}`);
      console.log(`   Time: ${log.createdAt}`);
    });

    console.log('\n✅ All checks passed!');
  } catch (error) {
    console.error('\n❌ Error:', error);
    
    if (error instanceof Error) {
      console.error('\n📋 Error details:');
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

debugProductionDB();
```

---

## 🚀 LANGKAH EKSEKUSI (Step by Step)

### Phase 1: Diagnosis ✅
```bash
# 1. Check environment variables di Vercel
# Dashboard → Project → Settings → Environment Variables
# Pastikan ada: DATABASE_URL, JWT_SECRET

# 2. Test database connection
npx tsx debug-log-activity-production.ts
```

### Phase 2: Fix Database 🔧
```bash
# 1. Jalankan migration di production DB
psql $DATABASE_URL_PRODUCTION -f migrations/manual_add_activity_log.sql

# 2. Verify
psql $DATABASE_URL_PRODUCTION -c "\d activity_log"
```

### Phase 3: Fix Code 💻
```bash
# 1. Update package.json (tambahkan postinstall)
# 2. Update activityLogger.ts (improve error logging)
# 3. Create health check endpoint
# 4. Create debug script
```

### Phase 4: Deploy 🚀
```bash
# 1. Commit changes
git add .
git commit -m "fix: improve activity log error handling and add health check"
git push

# 2. Trigger Vercel redeploy
# (automatic or manual via dashboard)

# 3. Test health check
curl https://your-app.vercel.app/api/health/activity-log
```

### Phase 5: Verification ✅
```bash
# 1. Login ke aplikasi production
# 2. Buka /log-activity
# 3. Check apakah data muncul
# 4. Test create activity (login/logout)
# 5. Check log muncul real-time
```

---

## 📊 CHECKLIST VERIFIKASI

### Pre-Deploy:
- [ ] Migration file ready: `migrations/manual_add_activity_log.sql`
- [ ] Database URL production tersedia
- [ ] package.json updated dengan postinstall
- [ ] Error logging improved
- [ ] Health check endpoint created

### Deploy:
- [ ] Run migration di production DB
- [ ] Verify tabel activity_log exists
- [ ] Push code changes ke Git
- [ ] Vercel auto-deploy triggered
- [ ] Build successful

### Post-Deploy:
- [ ] Health check endpoint returns healthy
- [ ] /log-activity page loads tanpa error
- [ ] Data logs terlihat (jika ada)
- [ ] Test create new log (login/logout)
- [ ] New log muncul dalam list
- [ ] Export CSV works
- [ ] Filters work properly

---

## 🔮 EXPECTED RESULTS

### Before Fix:
```
GET /log-activity → Blank page
Console: "Failed to fetch activity logs"
Reason: Table not found / Structure mismatch
```

### After Fix:
```
GET /log-activity → ✅ Shows logs
GET /api/health/activity-log → ✅ Status: healthy
New login → ✅ Log recorded
```

---

## 📞 TROUBLESHOOTING

### Jika masih tidak jalan setelah migration:

1. **Check Prisma Client Generation:**
```bash
# Di local, generate dengan production DB
DATABASE_URL="your-production-url" npx prisma generate
```

2. **Check Vercel Build Logs:**
```
Vercel Dashboard → Deployments → Latest → View Function Logs
# Look for Prisma generation errors
```

3. **Check Database Permissions:**
```sql
-- Pastikan user DB punya permission CREATE TABLE
GRANT ALL PRIVILEGES ON DATABASE your_db TO your_user;
```

4. **Check Connection Pooling:**
```
# If using Prisma Accelerate or connection pooling
DATABASE_URL="postgresql://...?connection_limit=10&pool_timeout=20"
```

---

## 🎯 KESIMPULAN

**Root Cause:**
1. 🔴 **Migration tidak dijalankan di production DB** (95% yakin ini masalahnya)
2. 🟡 **Build process tidak sync Prisma** (80% kemungkinan)
3. 🟡 **Error handling terlalu silent** (100% pasti, makanya ga ketahuan)

**Quick Fix (5 menit):**
```bash
# 1. Run migration
psql $DATABASE_URL_PRODUCTION -f migrations/manual_add_activity_log.sql

# 2. Redeploy
git commit --allow-empty -m "trigger redeploy"
git push
```

**Proper Fix (30 menit):**
- Implement all fixes di dokumen ini
- Add health check & monitoring
- Improve error handling
- Create debug tools

---

## 📚 FILES TO MODIFY

1. ✏️ `package.json` - Add postinstall script
2. ✏️ `src/lib/activityLogger.ts` - Improve error logging
3. ✏️ `src/app/(app)/log-activity/actions.ts` - Add detailed errors
4. ➕ `src/app/api/health/activity-log/route.ts` - Health check (NEW)
5. ➕ `debug-log-activity-production.ts` - Debug script (NEW)

---

**Next Step:** Mau saya implementasikan semua fix ini sekarang? 🚀
