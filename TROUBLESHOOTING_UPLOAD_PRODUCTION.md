# 🔧 TROUBLESHOOTING: Upload Tidak Berfungsi di Production

## 🚨 Masalah yang Dilaporkan

- ❌ Tidak bisa menambah surat
- ❌ Tidak bisa ganti foto profil
- ❌ Fitur upload lainnya

**Status:** Perlu diagnostik lebih lanjut

---

## 📋 Checklist Diagnostik

### 1. ✅ Verifikasi Kode Sudah Benar (DONE)

- [x] `src/app/(app)/profile/actions.ts` - Base64 encoding ✅
- [x] `src/app/(app)/admin/users/actions.ts` - Base64 encoding ✅  
- [x] `src/app/(app)/admin/actions.ts` - Base64 encoding ✅
- [x] `prisma/schema.prisma` - @db.Text added ✅

### 2. ⚠️ Verifikasi Database Production (PERLU DICEK!)

**CRITICAL:** Database di production mungkin belum ter-update!

#### Cara Check Database Schema Production:

```bash
# Connect ke production database
npx prisma db pull --force

# Atau check manual di Vercel/Railway dashboard
```

#### Yang Harus Dicek:

```sql
-- Check tipe kolom di production database
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'pengguna' 
  AND column_name = 'profilePictureUrl';

-- Expected result:
-- column_name          | data_type | character_maximum_length
-- profilePictureUrl    | text      | NULL

-- Jika masih VARCHAR(255) atau VARCHAR(xxx) → MASALAH DI SINI!
```

#### Jika Schema Belum Update:

**Option A: Migrate via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Pull production database URL
vercel env pull .env.production

# Run migration
DATABASE_URL="<production-db-url>" npx prisma db push
```

**Option B: Manual Migration SQL**
```sql
-- Run langsung di production database console

ALTER TABLE pengguna 
  ALTER COLUMN "profilePictureUrl" TYPE TEXT;

ALTER TABLE lampiran 
  ALTER COLUMN path_file TYPE TEXT;
```

**Option C: Via Railway/Vercel Dashboard**
- Login ke dashboard database provider
- Go to SQL Console / Query Editor
- Run SQL di atas

---

### 3. ⚠️ Verifikasi Deploy Status

#### Check Git Status:
```bash
git status
git log --oneline -5
```

#### Check Vercel Deployment:
- Go to https://vercel.com/dashboard
- Check latest deployment status
- Look for build errors
- Check deployment logs

#### Jika Belum Deploy:
```bash
# Commit semua changes
git add .
git commit -m "fix: Implement Base64 upload for serverless compatibility

- Update database schema (profilePictureUrl & path_file to TEXT)
- Implement Base64 encoding for all file uploads
- Add file size validation (2MB photos, 3MB PDFs)
- Remove filesystem dependencies

Fixes upload issues in serverless environment (Vercel)"

# Push ke GitHub (Vercel auto-deploy)
git push origin master

# Monitor deployment di Vercel dashboard
```

---

### 4. ⚠️ Check Error Logs

#### Di Vercel Dashboard:
1. Go to Project → Deployments → Latest
2. Click "View Function Logs"
3. Filter by "Error" or search "upload"

#### Common Errors:

**Error 1: "value too long for type character varying(255)"**
```
❌ Meaning: Database column still VARCHAR(255), Base64 too long
✅ Fix: Run database migration (see step 2)
```

**Error 2: "EROFS: read-only file system"**
```
❌ Meaning: Code masih pakai fs.writeFile (old code)
✅ Fix: Pastikan code sudah ter-update dan ter-deploy
```

**Error 3: "Payload too large"**
```
❌ Meaning: Request body >4.5MB (Vercel limit)
✅ Fix: File terlalu besar, enforce size limit
```

**Error 4: "Invalid Base64 string"**
```
❌ Meaning: Encoding error
✅ Fix: Check mimeType & buffer conversion
```

---

## 🔍 Manual Testing Steps

### Test 1: Test Upload di Production

1. Go to production URL
2. Open Browser DevTools (F12)
3. Go to Network tab
4. Try upload foto profil
5. Check request/response:

**Expected Request:**
```json
{
  "nama": "User Name",
  "username": "username",
  "nrp_nip": "123456",
  "profilePicture": "[File Object]"
}
```

**Expected Response (Success):**
```json
{
  "success": "Profil berhasil diperbarui."
}
```

**Expected Response (Error - Need Fix):**
```json
{
  "error": "value too long for type character varying(255)"
}
```
→ Database belum di-migrate!

```json
{
  "error": "EROFS: read-only file system..."
}
```
→ Code belum ter-deploy!

---

### Test 2: Test Database Connection

Create API route untuk test:

```typescript
// src/app/api/test-db-schema/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test query
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'pengguna' 
        AND column_name = 'profilePictureUrl'
    `;
    
    return NextResponse.json({
      success: true,
      schema: result,
      message: 'Check if data_type is "text" (not character varying)'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

Access: `https://your-app.vercel.app/api/test-db-schema`

**Expected Result:**
```json
{
  "success": true,
  "schema": [
    {
      "column_name": "profilePictureUrl",
      "data_type": "text",  // ✅ GOOD
      "character_maximum_length": null
    }
  ]
}
```

**Bad Result:**
```json
{
  "success": true,
  "schema": [
    {
      "column_name": "profilePictureUrl",
      "data_type": "character varying",  // ❌ PROBLEM!
      "character_maximum_length": 255
    }
  ]
}
```

---

## 🚀 Quick Fix Guide

### Scenario 1: Database Belum Migrate

**Problem:** Column still VARCHAR(255)  
**Fix:** Run migration on production

```bash
# Option 1: Via prisma db push
DATABASE_URL="<production-url>" npx prisma db push

# Option 2: Via SQL (faster)
# Run di database console:
ALTER TABLE pengguna ALTER COLUMN "profilePictureUrl" TYPE TEXT;
ALTER TABLE lampiran ALTER COLUMN path_file TYPE TEXT;
```

### Scenario 2: Code Belum Deploy

**Problem:** Old code still running  
**Fix:** Deploy to Vercel

```bash
git add .
git commit -m "fix: Base64 upload implementation"
git push origin master
# Wait for Vercel auto-deploy (~2-5 min)
```

### Scenario 3: Both!

**Fix:** Do both steps above in order:
1. First: Migrate database
2. Then: Deploy code
3. Test again

---

## 🧪 Testing After Fix

### Checklist:
- [ ] Go to production URL
- [ ] Login as admin
- [ ] Try upload foto profil (< 2MB)
  - [ ] Success? ✅
  - [ ] Error? → Check logs
- [ ] Try create surat dengan lampiran (< 3MB)
  - [ ] Success? ✅
  - [ ] Error? → Check logs
- [ ] Check database:
  - [ ] profilePictureUrl starts with `data:image/`? ✅
  - [ ] path_file starts with `data:application/`? ✅

---

## 📞 Next Steps

### If Still Not Working:

1. **Collect Error Details:**
   - Screenshot error message
   - Copy error from browser console
   - Copy error from Vercel logs
   - Note the exact step when error occurs

2. **Check These:**
   - [ ] Database connection working?
   - [ ] Database schema correct (TEXT not VARCHAR)?
   - [ ] Latest code deployed to Vercel?
   - [ ] Environment variables correct?
   - [ ] File size within limits?

3. **Try Test API Route:**
   Create the test endpoint above and check schema

4. **Contact Support:**
   With all details collected above

---

## 💡 Prevention for Future

### Before Deploy:
- [ ] Test in localhost
- [ ] Check database migrations
- [ ] Verify schema changes
- [ ] Review Vercel deployment logs
- [ ] Test in production immediately after deploy

### Monitoring:
- [ ] Setup error logging (Sentry, LogRocket)
- [ ] Monitor Vercel function logs
- [ ] Track database size
- [ ] User feedback channel

---

## 🎓 Common Mistakes

### Mistake 1: Forgot to Migrate Production DB
```
❌ "I ran prisma migrate locally, why not working in production?"
✅ Local and production are different databases!
```

### Mistake 2: Code Not Deployed
```
❌ "I committed but didn't push to GitHub"
✅ Vercel deploys from GitHub, must push!
```

### Mistake 3: Wrong Branch
```
❌ "Pushed to 'dev' branch, production uses 'master'"
✅ Check Vercel project settings for production branch
```

### Mistake 4: File Too Large
```
❌ "Trying to upload 10MB PDF"
✅ Current limit: 3MB for PDFs, 2MB for photos
```

---

## 📊 Status Dashboard

### Current Implementation Status:

| Component | Status | Notes |
|-----------|--------|-------|
| Local Code | ✅ DONE | Base64 implemented |
| Local DB | ✅ DONE | Schema updated |
| Production Code | ⚠️ UNKNOWN | Need to verify deploy |
| Production DB | ⚠️ UNKNOWN | Need to verify schema |
| Testing | ⏳ PENDING | Need production test |

### Action Items:

**Priority 1 (DO NOW):**
1. ⚠️ Verify production database schema
2. ⚠️ Verify latest deployment status
3. ⚠️ Run migration if needed

**Priority 2 (AFTER P1):**
4. 🧪 Test upload in production
5. 📊 Monitor logs for errors
6. 📝 Document results

**Priority 3 (OPTIONAL):**
7. 🔧 Create test API endpoint
8. 📈 Setup monitoring
9. 📚 Update documentation

---

**Next Action:** Run diagnostics checklist above! 🚀
