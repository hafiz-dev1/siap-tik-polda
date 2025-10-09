# 🚨 ACTION PLAN: Fix Upload di Production

## 📋 Status Saat Ini

**Masalah:** Upload tidak berfungsi di server online (Vercel)
- ❌ Tidak bisa menambah surat
- ❌ Tidak bisa ganti foto profil

**Kemungkinan Penyebab:**
1. ⚠️ Database production belum di-migrate (masih VARCHAR, bukan TEXT)
2. ⚠️ Code belum ter-deploy ke Vercel

---

## 🔍 STEP 1: Diagnostik (LAKUKAN INI DULU!)

### Option A: Via API Test Endpoint (RECOMMENDED)

1. **Commit & Deploy test endpoint:**
   ```bash
   git add .
   git commit -m "add: Test DB schema endpoint for diagnostics"
   git push origin master
   ```

2. **Wait for Vercel deployment** (~2-5 menit)

3. **Access test endpoint:**
   - Go to: `https://your-app.vercel.app/api/test-db-schema`
   - Login as SUPER_ADMIN first
   - Check response

4. **Interpret results:**

   **✅ GOOD Response:**
   ```json
   {
     "status": "✅ ALL SCHEMAS CORRECT - Ready for Base64 uploads",
     "analysis": {
       "pengguna_profilePictureUrl": {
         "isCorrect": true,
         "actual": "text"
       },
       "lampiran_path_file": {
         "isCorrect": true,
         "actual": "text"
       }
     }
   }
   ```
   → **Skip to STEP 3** (deploy main code)

   **❌ BAD Response:**
   ```json
   {
     "status": "❌ MIGRATION NEEDED",
     "analysis": {
       "pengguna_profilePictureUrl": {
         "isCorrect": false,
         "actual": "character varying"
       }
     }
   }
   ```
   → **Proceed to STEP 2** (run migration)

### Option B: Manual Check via Database Console

1. Login ke database provider (Railway/Vercel Postgres/etc)
2. Go to SQL Console
3. Run:
   ```sql
   SELECT column_name, data_type, character_maximum_length
   FROM information_schema.columns
   WHERE table_name = 'pengguna' 
     AND column_name = 'profilePictureUrl';
   ```
4. Check result:
   - `data_type = 'text'` → ✅ GOOD
   - `data_type = 'character varying'` → ❌ NEED MIGRATION

---

## 🔧 STEP 2: Run Migration (JIKA DIPERLUKAN)

### Jika Test Menunjukkan Schema Masih VARCHAR:

#### Option A: Via Database Console (FASTEST)

1. Login ke database provider dashboard
2. Go to SQL Console / Query Editor
3. Run migration SQL:
   ```sql
   -- Change profilePictureUrl to TEXT
   ALTER TABLE pengguna 
     ALTER COLUMN "profilePictureUrl" TYPE TEXT;

   -- Change path_file to TEXT
   ALTER TABLE lampiran 
     ALTER COLUMN path_file TYPE TEXT;
   ```
4. Verify success:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name IN ('pengguna', 'lampiran')
     AND column_name IN ('profilePictureUrl', 'path_file');
   ```

#### Option B: Via Prisma (Safer but Slower)

1. **Get production database URL:**
   - From Vercel dashboard: Settings → Environment Variables
   - Copy `DATABASE_URL`

2. **Create temp .env file:**
   ```bash
   # .env.production.temp
   DATABASE_URL="your-production-database-url"
   ```

3. **Run migration:**
   ```bash
   # Load production env
   cp .env.production.temp .env

   # Push schema changes
   npx prisma db push

   # Restore local env
   cp .env.backup .env
   ```

4. **Verify:**
   - Access test endpoint again
   - Should show "text" now

---

## 🚀 STEP 3: Deploy Code ke Production

### Commit & Push Changes:

```bash
# Check status
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "fix: Implement Base64 upload for serverless compatibility

Changes:
- Update database schema (profilePictureUrl & path_file to TEXT)
- Implement Base64 encoding for all file uploads
- Add file size validation (2MB photos, 3MB PDFs)
- Remove filesystem dependencies (fs, path)
- Add test endpoint for schema verification

This fixes upload functionality in Vercel serverless environment.

Tested:
- ✅ Local upload works
- ✅ Database schema updated
- ✅ No TypeScript errors
- ⏳ Pending production test

Fixes: #upload-issue"

# Push to GitHub (triggers Vercel auto-deploy)
git push origin master
```

### Monitor Deployment:

1. Go to https://vercel.com/dashboard
2. Check deployment status
3. Wait for "Ready" status (~2-5 minutes)
4. Check deployment logs for errors

---

## ✅ STEP 4: Test di Production

### Test Checklist:

1. **Test Upload Foto Profil:**
   - [ ] Login ke production app
   - [ ] Go to Profile page
   - [ ] Select photo < 2MB
   - [ ] Click upload
   - [ ] Success message appears? ✅
   - [ ] Photo displays correctly? ✅
   - [ ] Check browser console for errors

2. **Test Create Surat:**
   - [ ] Login as Admin
   - [ ] Go to create surat page
   - [ ] Fill form
   - [ ] Upload PDF < 3MB
   - [ ] Submit
   - [ ] Success message appears? ✅
   - [ ] Surat created? ✅
   - [ ] Lampiran can be viewed/downloaded? ✅

3. **Test Create User (Admin):**
   - [ ] Login as Admin
   - [ ] Go to create user page
   - [ ] Fill form
   - [ ] Upload photo < 2MB
   - [ ] Submit
   - [ ] User created successfully? ✅
   - [ ] Photo displays in user list? ✅

### If Test Fails:

1. **Open Browser DevTools (F12)**
2. **Check Console tab for errors**
3. **Check Network tab:**
   - Find failed request
   - Check request payload
   - Check response error
4. **Check Vercel Logs:**
   - Go to Vercel Dashboard
   - Deployment → View Function Logs
   - Look for error details

---

## 🔍 STEP 5: Verify Database

### Check Data was Saved as Base64:

```sql
-- Check if profilePictureUrl is Base64
SELECT 
  username,
  CASE 
    WHEN "profilePictureUrl" LIKE 'data:image/%' THEN 'Base64 ✅'
    WHEN "profilePictureUrl" LIKE '/uploads/%' THEN 'File Path ⚠️'
    WHEN "profilePictureUrl" IS NULL THEN 'No Photo'
    ELSE 'Unknown Format'
  END as storage_type,
  LENGTH("profilePictureUrl") as data_length
FROM pengguna
WHERE "profilePictureUrl" IS NOT NULL
LIMIT 5;

-- Check lampiran
SELECT 
  nama_file,
  CASE 
    WHEN path_file LIKE 'data:application/%' THEN 'Base64 ✅'
    WHEN path_file LIKE '/uploads/%' THEN 'File Path ⚠️'
    ELSE 'Unknown Format'
  END as storage_type,
  LENGTH(path_file) as data_length
FROM lampiran
LIMIT 5;
```

**Expected Result:**
- storage_type: "Base64 ✅"
- data_length: > 1000 (Base64 strings are long)

---

## 📊 Success Criteria

### All Must Pass:

- [x] Code changes committed & pushed
- [x] Database schema updated (TEXT not VARCHAR)
- [x] Vercel deployment successful (no errors)
- [x] Test endpoint shows schema correct
- [x] Upload foto profil works
- [x] Create surat dengan lampiran works
- [x] Data saved as Base64 in database
- [x] Images/PDFs display correctly
- [x] No errors in browser console
- [x] No errors in Vercel logs

---

## 🆘 Troubleshooting

### Problem: "value too long for type character varying(255)"

**Cause:** Database not migrated  
**Fix:** Go back to STEP 2, run migration

### Problem: "EROFS: read-only file system"

**Cause:** Old code still running  
**Fix:** Verify deployment completed, check code version

### Problem: "Payload too large"

**Cause:** File > 4.5MB (Vercel limit)  
**Fix:** Enforce stricter size limits, or compress file

### Problem: Image not displaying

**Cause:** Invalid Base64 or MIME type  
**Fix:** Check browser console, verify data format

### Problem: 403 Unauthorized on test endpoint

**Cause:** Not logged in as SUPER_ADMIN  
**Fix:** Login first, then access endpoint

---

## 📞 Quick Reference

### Important URLs:

- **Production App:** `https://your-app.vercel.app`
- **Test Endpoint:** `https://your-app.vercel.app/api/test-db-schema`
- **Vercel Dashboard:** `https://vercel.com/dashboard`
- **GitHub Repo:** `https://github.com/hafiz-dev1/siad-tik-polda`

### Important Commands:

```bash
# Check git status
git status

# Deploy to production
git add .
git commit -m "fix: your message"
git push origin master

# Check database schema locally
npx prisma db pull

# Migrate production database
DATABASE_URL="prod-url" npx prisma db push
```

---

## 🎯 Next Actions (IN ORDER)

1. **[ ] STEP 1:** Run diagnostik (access test endpoint)
2. **[ ] STEP 2:** Run migration jika diperlukan
3. **[ ] STEP 3:** Deploy code ke production
4. **[ ] STEP 4:** Test semua fitur upload
5. **[ ] STEP 5:** Verify data di database

**Estimated Time:** 15-30 menit total

---

**Status:** 📝 READY TO EXECUTE  
**Priority:** 🔴 CRITICAL  
**Start:** NOW!
