# 🔍 ANALISIS MENDALAM: Fitur Tidak Berfungsi di Server Online

## 📋 Executive Summary

**Tanggal Analisis:** 9 Oktober 2025  
**Status:** 🔴 CRITICAL - Beberapa fitur core tidak berfungsi di production  
**Platform Production:** Vercel (Serverless)  
**Root Cause:** Filesystem Read-Only di Environment Serverless  

---

## 🎯 Problem Statement

### Gejala Utama:
- ✅ **Localhost:** Semua fitur upload berfungsi normal
- ❌ **Server Online (Vercel):** Upload gagal dengan error `EROFS: read-only file system`

### Fitur yang Terpengaruh:
1. **Upload Foto Profil** (user profile update)
2. **Upload Foto saat Create User** (admin create user)
3. **Upload Scan Surat/Lampiran** (admin create surat)

---

## 🔬 Root Cause Analysis

### 1. Perbedaan Environment: Localhost vs Vercel

| Aspek | Localhost (Development) | Vercel (Production/Serverless) |
|-------|------------------------|--------------------------------|
| **Filesystem** | Read-Write | **Read-Only** ⚠️ |
| **Persistent Storage** | ✅ Permanent | ❌ Ephemeral (hilang setelah deploy) |
| **File Write Access** | ✅ Allowed | ❌ **BLOCKED** |
| **Directory Creation** | ✅ Allowed | ❌ **BLOCKED** |
| **Path Access** | Full access | Limited to /tmp only |

### 2. Mengapa Filesystem Read-Only?

**Vercel Serverless Architecture:**
```
┌─────────────────────────────────────┐
│  Vercel Edge Network (CDN)          │
│  ┌───────────────────────────────┐  │
│  │  Lambda Function Instance     │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  /var/task (read-only)  │  │  │
│  │  │  ├── .next/             │  │  │
│  │  │  ├── public/            │  │  │  ← ❌ TIDAK BISA WRITE
│  │  │  │   └── uploads/       │  │  │
│  │  │  ├── src/               │  │  │
│  │  │  └── node_modules/      │  │  │
│  │  └─────────────────────────┘  │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  /tmp (writable)        │  │  │  ← ✅ BISA WRITE (tapi ephemeral)
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Alasan Vercel:**
- **Immutable deployments** - Setiap deploy adalah snapshot baru yang frozen
- **Horizontal scaling** - Multiple instances tidak share filesystem
- **Security** - Mencegah code injection melalui file upload
- **Performance** - Read-only fs lebih cepat dan predictable

---

## 📊 Detailed Impact Analysis

### Fitur 1: Upload Foto Profil (User Update) 🟡 MEDIUM

**File:** `src/app/(app)/profile/actions.ts`  
**Function:** `updateProfile()` (Lines 28-35)  

**Code yang Bermasalah:**
```typescript
if (profilePicture && profilePicture.size > 0) {
  const buffer = Buffer.from(await profilePicture.arrayBuffer());
  const filename = `${session.operatorId}-${profilePicture.name.replace(/\s/g, '_')}`;
  const uploadPath = path.join(process.cwd(), 'public/uploads/profiles', filename);
  await fs.mkdir(path.dirname(uploadPath), { recursive: true }); // ❌ GAGAL
  await fs.writeFile(uploadPath, buffer); // ❌ GAGAL
  dataToUpdate.profilePictureUrl = `/uploads/profiles/${filename}`;
}
```

**Impact:** Users tidak bisa update foto profil sama sekali

---

### Fitur 2: Upload Foto saat Create User 🟡 MEDIUM

**File:** `src/app/(app)/admin/users/actions.ts`  
**Function:** `createUser()` (Lines 80-88)  

**Code yang Bermasalah:** (sama dengan fitur 1)

**Impact:** Admin tidak bisa upload foto saat create user baru

---

### Fitur 3: Upload Scan Surat/Lampiran 🔴 CRITICAL

**File:** `src/app/(app)/admin/actions.ts`  
**Function:** `createSurat()` (Lines 92-100)  

**Code yang Bermasalah:**
```typescript
if (!scan_surat || scan_surat.size === 0) {
  return { error: 'Gagal: Scan surat wajib diupload.' };
}
const buffer = Buffer.from(await scan_surat.arrayBuffer());
const filename = `${Date.now()}-${scan_surat.name.replace(/\s/g, '_')}`;
const uploadPath = path.join(process.cwd(), 'public/uploads', filename);
await fs.mkdir(path.dirname(uploadPath), { recursive: true }); // ❌ GAGAL
await fs.writeFile(uploadPath, buffer); // ❌ GAGAL
```

**Impact:** **BLOCKING** - Surat tidak bisa dibuat sama sekali di production!

---

## 💡 Solusi: Base64 Encoding

### Mengapa Base64?

✅ **Kelebihan:**
- Zero setup, langsung berfungsi
- Tidak butuh external service
- Gratis selamanya
- Cocok untuk file <2-3MB

❌ **Kekurangan:**
- Database jadi lebih besar (+33% overhead)
- Tidak cocok untuk file sangat besar (>5MB)

### Estimasi Impact:
```
100 users × 300KB foto = 30MB → 40MB (Base64)
1000 surat × 2MB = 2GB → 2.66GB (Base64)
```

**Verdict:** ✅ ACCEPTABLE untuk scale kecil-menengah

---

## 🚀 Langkah Perbaikan

### Step 1: Update Database Schema

```prisma
model Pengguna {
  profilePictureUrl  String?  @db.Text  // ← UBAH dari String?
}

model Lampiran {
  path_file  String  @db.Text  // ← UBAH dari String
}
```

**Run Migration:**
```bash
npx prisma migrate dev --name support_base64_uploads
```

---

### Step 2: Fix Profile Actions

**File:** `src/app/(app)/profile/actions.ts`

**GANTI** logika upload (lines 28-35) dengan:
```typescript
if (profilePicture && profilePicture.size > 0) {
  // Validasi ukuran max 2MB
  if (profilePicture.size > 2 * 1024 * 1024) {
    return { error: 'Ukuran foto maksimal 2MB' };
  }

  const buffer = Buffer.from(await profilePicture.arrayBuffer());
  const base64 = buffer.toString('base64');
  const mimeType = profilePicture.type || 'image/jpeg';
  
  // Format Data URI untuk bisa langsung digunakan di <img src="..." />
  dataToUpdate.profilePictureUrl = `data:${mimeType};base64,${base64}`;
}
```

---

### Step 3: Fix Create User Actions

**File:** `src/app/(app)/admin/users/actions.ts`

**GANTI** logika upload (lines 80-88) dengan:
```typescript
if (profilePicture && profilePicture.size > 0) {
  if (profilePicture.size > 2 * 1024 * 1024) {
    return { error: 'Ukuran foto maksimal 2MB' };
  }

  const buffer = Buffer.from(await profilePicture.arrayBuffer());
  const base64 = buffer.toString('base64');
  const mimeType = profilePicture.type || 'image/jpeg';
  profilePictureUrl = `data:${mimeType};base64,${base64}`;
}
```

---

### Step 4: Fix Create Surat Actions

**File:** `src/app/(app)/admin/actions.ts`

**GANTI** logika upload (lines 97-100) dengan:
```typescript
if (!scan_surat || scan_surat.size === 0) {
  return { error: 'Gagal: Scan surat wajib diupload.' };
}

// Validasi ukuran max 3MB
if (scan_surat.size > 3 * 1024 * 1024) {
  return { error: 'Ukuran file maksimal 3MB. Kompres PDF terlebih dahulu.' };
}

const buffer = Buffer.from(await scan_surat.arrayBuffer());
const base64 = buffer.toString('base64');
const mimeType = scan_surat.type || 'application/pdf';
const publicPath = `data:${mimeType};base64,${base64}`;

// Lanjutkan dengan create surat...
```

---

## ✅ Testing Checklist

### Sebelum Deploy:
- [ ] Run migration di localhost
- [ ] Test upload foto profil (user)
- [ ] Test create user dengan foto (admin)
- [ ] Test create surat dengan lampiran
- [ ] Verify Base64 tampil di browser
- [ ] Check database size

### Setelah Deploy:
- [ ] Test semua fitur upload di production
- [ ] Monitor error logs
- [ ] Check database size growth
- [ ] Verify performance

---

## 📌 Important Notes

### Size Limits:
- **Foto Profil:** Max 2MB (rekomendasi 500KB)
- **Scan Surat:** Max 3MB (rekomendasi compress sebelum upload)

### Browser Support:
- ✅ Data URI supported di semua modern browsers
- ✅ Chrome, Firefox, Safari, Edge

### Database Considerations:
- Monitor growth dengan `SELECT pg_size_pretty(pg_database_size('database_name'));`
- Backup lebih besar, pertimbangkan backup strategy

---

## 🎓 Lessons Learned

1. **Serverless != Traditional Hosting** - File system behavior berbeda total
2. **Test in Production-like Environment** - Jangan asumsikan localhost = production
3. **Always Have Plan B** - Base64 sebagai fallback dari cloud storage
4. **Size Matters** - Enforce limits untuk prevent database bloat

---

## 📞 Next Steps

1. ✅ Implement fixes di semua 3 fitur
2. ✅ Test thoroughly di localhost
3. ✅ Deploy ke production dengan monitoring
4. ✅ Document for future reference
5. 🔄 **Future:** Consider Vercel Blob jika scale bertambah besar

---

**Status:** 🚀 READY TO IMPLEMENT  
**ETA:** 2-3 jam (termasuk testing)  
**Risk:** 🟢 LOW (reversible, well-tested solution)
