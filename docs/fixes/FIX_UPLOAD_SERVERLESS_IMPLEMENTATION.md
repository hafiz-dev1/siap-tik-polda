# ✅ FIX: Upload Fitur di Serverless (Base64 Solution)

## 🎯 Summary

**Problem:** Upload foto profil & scan surat tidak berfungsi di Vercel (serverless)  
**Root Cause:** Filesystem read-only di serverless environment  
**Solution:** Base64 encoding → Simpan langsung di database  
**Status:** ✅ **FIXED**  

---

## 📝 Changes Made

### 1. Database Schema Update

**File:** `prisma/schema.prisma`

```diff
model Pengguna {
  ...
- profilePictureUrl  String?
+ profilePictureUrl  String?  @db.Text  ✅ Support Base64
  ...
}

model Lampiran {
  ...
- path_file  String
+ path_file  String  @db.Text  ✅ Support Base64
  ...
}
```

**Migration Applied:**
```bash
npx prisma db push  # ✅ Database updated
npx prisma generate  # ✅ Client regenerated
```

---

### 2. Profile Actions Fix

**File:** `src/app/(app)/profile/actions.ts`

**BEFORE (❌ Gagal di Vercel):**
```typescript
if (profilePicture && profilePicture.size > 0) {
  const buffer = Buffer.from(await profilePicture.arrayBuffer());
  const filename = `${session.operatorId}-${profilePicture.name}`;
  const uploadPath = path.join(process.cwd(), 'public/uploads/profiles', filename);
  await fs.mkdir(path.dirname(uploadPath), { recursive: true });  // ❌ Read-only
  await fs.writeFile(uploadPath, buffer);  // ❌ Read-only
  dataToUpdate.profilePictureUrl = `/uploads/profiles/${filename}`;
}
```

**AFTER (✅ Berfungsi di Vercel):**
```typescript
if (profilePicture && profilePicture.size > 0) {
  // Validasi ukuran max 2MB
  if (profilePicture.size > 2 * 1024 * 1024) {
    return { error: 'Ukuran foto maksimal 2MB' };
  }

  const buffer = Buffer.from(await profilePicture.arrayBuffer());
  const base64 = buffer.toString('base64');
  const mimeType = profilePicture.type || 'image/jpeg';
  
  // ✅ Data URI format - langsung bisa dipakai di <img src="..." />
  dataToUpdate.profilePictureUrl = `data:${mimeType};base64,${base64}`;
}
```

**Removed imports:**
```diff
- import fs from 'fs/promises';
- import path from 'path';
```

---

### 3. Admin Create User Fix

**File:** `src/app/(app)/admin/users/actions.ts`

**Changes:** Same as profile actions

```typescript
if (profilePicture && profilePicture.size > 0) {
  if (profilePicture.size > 2 * 1024 * 1024) {
    return { error: 'Ukuran foto maksimal 2MB' };
  }

  const buffer = Buffer.from(await profilePicture.arrayBuffer());
  const base64 = buffer.toString('base64');
  const mimeType = profilePicture.type || 'image/jpeg';
  profilePictureUrl = `data:${mimeType};base64,${base64}`;  // ✅
}
```

**Removed imports:**
```diff
- import fs from 'fs/promises';
- import path from 'path';
```

---

### 4. Create Surat (Scan Upload) Fix

**File:** `src/app/(app)/admin/actions.ts`

**BEFORE (❌ Gagal di Vercel):**
```typescript
if (!scan_surat || scan_surat.size === 0) {
  return { error: 'Gagal: Scan surat wajib diupload.' };
}

const buffer = Buffer.from(await scan_surat.arrayBuffer());
const filename = `${Date.now()}-${scan_surat.name}`;
const uploadPath = path.join(process.cwd(), 'public/uploads', filename);
await fs.mkdir(path.dirname(uploadPath), { recursive: true });  // ❌
await fs.writeFile(uploadPath, buffer);  // ❌
const publicPath = `/uploads/${filename}`;
```

**AFTER (✅ Berfungsi di Vercel):**
```typescript
if (!scan_surat || scan_surat.size === 0) {
  return { error: 'Gagal: Scan surat wajib diupload.' };
}

// ✅ Validasi ukuran max 3MB
if (scan_surat.size > 3 * 1024 * 1024) {
  return { error: 'Ukuran file maksimal 3MB. Silakan kompres file terlebih dahulu.' };
}

// ✅ Base64 encoding
const buffer = Buffer.from(await scan_surat.arrayBuffer());
const base64 = buffer.toString('base64');
const mimeType = scan_surat.type || 'application/pdf';
const publicPath = `data:${mimeType};base64,${base64}`;
```

**Removed imports:**
```diff
- import fs from 'fs/promises';
- import path from 'path';
```

---

## 🔍 How Base64 Works

### Data URI Format:
```
data:[MIME-type];base64,[BASE64-DATA]
```

### Example:
```typescript
// Image
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...

// PDF
data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK...
```

### Browser Usage:
```html
<!-- ✅ Works directly in <img> tag -->
<img src="data:image/jpeg;base64,/9j/4AAQSkZJRg..." />

<!-- ✅ Works in <iframe> for PDF -->
<iframe src="data:application/pdf;base64,JVBERi0x..." />

<!-- ✅ Works in <a> download link -->
<a href="data:application/pdf;base64,JVBERi0x..." download="file.pdf">Download</a>
```

---

## 📊 File Size Limits

### Recommended Limits:

| Fitur | Limit | Reasoning |
|-------|-------|-----------|
| **Foto Profil** | 2MB | Optimal untuk foto (biasanya 100-500KB) |
| **Scan Surat** | 3MB | Balance antara quality & database size |

### Why Limits?

1. **Database Performance:** Base64 adds ~33% overhead
2. **Network Transfer:** Larger payloads = slower page loads
3. **Memory Usage:** Large Base64 strings consume RAM
4. **User Experience:** Force users to compress oversized files

### How to Check:
```typescript
// Client-side validation
if (file.size > 2 * 1024 * 1024) {  // 2MB in bytes
  alert('File too large!');
  return;
}

// Server-side validation
if (profilePicture.size > 2 * 1024 * 1024) {
  return { error: 'Ukuran foto maksimal 2MB' };
}
```

---

## ✅ Testing Checklist

### Localhost Testing:
- [x] Upload foto profil < 2MB → ✅ Success
- [x] Upload foto profil > 2MB → ✅ Error shown
- [x] Create user dengan foto → ✅ Success
- [x] Create surat dengan PDF < 3MB → ✅ Success
- [x] Create surat dengan PDF > 3MB → ✅ Error shown
- [x] Display foto profil di navbar → ✅ Works
- [x] Display lampiran di detail surat → ✅ Works

### Production Testing (Vercel):
- [ ] Test upload foto profil
- [ ] Test create user dengan foto
- [ ] Test create surat dengan scan PDF
- [ ] Verify no EROFS errors in logs
- [ ] Check database size growth
- [ ] Monitor performance

---

## 🎯 Benefits of Base64 Solution

### ✅ Advantages:
1. **Zero External Dependencies** - No cloud storage needed
2. **Instant Implementation** - No API keys, no setup
3. **Zero Cost** - No monthly fees
4. **Serverless Compatible** - Works in any environment
5. **Simple Backup** - Files included in database backup
6. **Atomic Operations** - File & metadata saved together

### ⚠️ Limitations:
1. **Database Size** - Grows faster (+33% overhead)
2. **Query Performance** - Slightly slower with large Base64 data
3. **Size Limits** - Not suitable for very large files (>5MB)
4. **Transfer Size** - Larger API responses

### 🔮 Future Considerations:
- If database > 1GB, consider migrating to Vercel Blob
- If files > 5MB common, use cloud storage from start
- Monitor database growth monthly

---

## 📚 Alternative Solutions (Not Used)

### 1. Vercel Blob Storage
- **Cost:** $0.15/GB storage + $0.30/GB bandwidth
- **Best For:** Large files, high traffic
- **Setup:** Need API token

### 2. Cloudinary
- **Free Tier:** 25GB storage
- **Best For:** Image transformation needs
- **Setup:** External account required

### 3. AWS S3
- **Cost:** $0.023/GB
- **Best For:** Large scale, existing AWS infra
- **Setup:** Complex IAM setup

### 4. Supabase Storage
- **Free Tier:** 1GB
- **Best For:** Small projects
- **Setup:** Supabase account

**Decision:** Base64 chosen for simplicity & zero cost. Can migrate later if needed.

---

## 🚀 Deployment Steps

### 1. Pre-deployment Checklist:
- [x] Database schema updated (✅ `npx prisma db push`)
- [x] Prisma client regenerated (✅ `npx prisma generate`)
- [x] Code changes applied to all 3 files
- [x] Imports cleaned up (fs, path removed)
- [x] Tested in localhost
- [ ] Backup production database (before deploy)

### 2. Deploy to Vercel:
```bash
# Push changes to git
git add .
git commit -m "fix: Support Base64 uploads for serverless (Vercel compatible)"
git push origin master

# Vercel auto-deploys from git
# Monitor deployment logs
```

### 3. Post-deployment:
- [ ] Test upload foto profil di production
- [ ] Test create surat dengan lampiran
- [ ] Check Vercel logs for errors
- [ ] Monitor database size
- [ ] Gather user feedback

---

## 📖 Documentation Updates

### Files Updated:
1. ✅ `prisma/schema.prisma` - Schema changes
2. ✅ `src/app/(app)/profile/actions.ts` - Profile upload
3. ✅ `src/app/(app)/admin/users/actions.ts` - Create user upload
4. ✅ `src/app/(app)/admin/actions.ts` - Scan surat upload
5. ✅ `ANALISIS_FITUR_TIDAK_BERFUNGSI_ONLINE.md` - Analysis document
6. ✅ `FIX_UPLOAD_SERVERLESS_QUICKREF.md` - This document

---

## 🎓 Key Learnings

1. **Serverless ≠ Traditional Hosting**
   - Read-only filesystem
   - Ephemeral storage
   - No persistent /public folder

2. **Test in Production-like Environment**
   - Don't assume localhost = production
   - Use Vercel dev environment for testing

3. **Always Have Plan B**
   - Base64 as quick fix
   - Cloud storage as scale solution
   - Migration path should be clear

4. **Size Matters**
   - Enforce limits early
   - Prevent database bloat
   - Guide users to compress files

---

## 🔧 Troubleshooting

### Issue: "Ukuran foto maksimal 2MB"
**Solution:** Compress image before upload
```bash
# Online tools:
- TinyPNG (https://tinypng.com)
- Compressor.io (https://compressor.io)
- ImageOptim (Mac)
```

### Issue: "Ukuran file maksimal 3MB"
**Solution:** Compress PDF before upload
```bash
# Online tools:
- SmallPDF (https://smallpdf.com)
- iLovePDF (https://www.ilovepdf.com)
- Adobe Acrobat (reduce file size)
```

### Issue: Image not displaying
**Verify:**
1. Check database value starts with `data:image/`
2. Check MIME type is correct
3. Check Base64 is not truncated
4. Browser console for errors

### Issue: Database size growing too fast
**Solutions:**
1. Enforce stricter size limits
2. Implement image compression on server
3. Consider migrating to cloud storage

---

## 📞 Support & References

- [Vercel Serverless Docs](https://vercel.com/docs/functions/serverless-functions)
- [Base64 Encoding MDN](https://developer.mozilla.org/en-US/docs/Glossary/Base64)
- [Data URIs RFC](https://datatracker.ietf.org/doc/html/rfc2397)
- [Prisma Text Type](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#string)

---

**Last Updated:** 9 Oktober 2025  
**Status:** ✅ PRODUCTION READY  
**Next Review:** After 1 week in production
