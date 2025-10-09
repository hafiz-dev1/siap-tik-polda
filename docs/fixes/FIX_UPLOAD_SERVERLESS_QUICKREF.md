# 🚀 QUICK FIX: Upload Foto di Serverless (Base64 Solution)

## ⚡ Ringkasan

**Problem:** Upload foto tidak berfungsi di Vercel (serverless)  
**Root Cause:** Filesystem read-only & ephemeral  
**Solution:** Simpan foto sebagai Base64 di database  
**Time:** 30 menit  

---

## 📝 Checklist Implementasi

### ✅ Step 1: Update Database Schema (5 menit)

```prisma
// File: prisma/schema.prisma

model Pengguna {
  id                 String    @id @default(cuid())
  nama               String
  username           String    @unique
  password           String
  nrp_nip            String?
  profilePictureUrl  String?   @db.Text  // ← UBAH: dari String? ke String? @db.Text
  role               Role      @default(OPERATOR)
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  deletedAt          DateTime?
  
  suratDisposisiKe  Surat[]         @relation("DisposisiKe")
  suratDariPengguna Surat[]         @relation("DariPengguna")
  logActivity       LogActivity[]
}
```

**Jalankan Migration:**
```bash
npx prisma migrate dev --name profile_picture_base64
```

---

### ✅ Step 2: Update Profile Actions (10 menit)

**File: `src/app/(app)/profile/actions.ts`**

**SEBELUM:**
```typescript
// ❌ Tidak berfungsi di Vercel
if (profilePicture && profilePicture.size > 0) {
  const buffer = Buffer.from(await profilePicture.arrayBuffer());
  const filename = `${session.operatorId}-${profilePicture.name.replace(/\s/g, '_')}`;
  const uploadPath = path.join(process.cwd(), 'public/uploads/profiles', filename);
  await fs.mkdir(path.dirname(uploadPath), { recursive: true });
  await fs.writeFile(uploadPath, buffer);
  dataToUpdate.profilePictureUrl = `/uploads/profiles/${filename}`;
}
```

**SESUDAH:**
```typescript
// ✅ Berfungsi di Vercel (Base64)
if (profilePicture && profilePicture.size > 0) {
  // Validasi ukuran (max 2MB untuk performa optimal)
  if (profilePicture.size > 2 * 1024 * 1024) {
    return { error: 'Ukuran foto maksimal 2MB' };
  }

  const buffer = Buffer.from(await profilePicture.arrayBuffer());
  const base64 = buffer.toString('base64');
  const mimeType = profilePicture.type || 'image/jpeg';
  
  // Format Data URI: data:image/jpeg;base64,/9j/4AAQSkZJRg...
  dataToUpdate.profilePictureUrl = `data:${mimeType};base64,${base64}`;
}
```

**Full Function:**
```typescript
export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: 'Tidak terautentikasi' };

  const nama = formData.get('nama') as string;
  const username = formData.get('username') as string;
  const nrp_nip = formData.get('nrp_nip') as string | null;
  const profilePicture = formData.get('profilePicture') as File | null;

  const dataToUpdate: any = { nama, username, nrp_nip };

  try {
    // ✅ Base64 encoding untuk serverless compatibility
    if (profilePicture && profilePicture.size > 0) {
      if (profilePicture.size > 2 * 1024 * 1024) {
        return { error: 'Ukuran foto maksimal 2MB' };
      }

      const buffer = Buffer.from(await profilePicture.arrayBuffer());
      const base64 = buffer.toString('base64');
      const mimeType = profilePicture.type || 'image/jpeg';
      dataToUpdate.profilePictureUrl = `data:${mimeType};base64,${base64}`;
    }

    await prisma.pengguna.update({
      where: { id: session.operatorId },
      data: dataToUpdate,
    });

    await logActivity({
      userId: session.operatorId,
      category: 'PROFILE',
      type: 'UPDATE',
      description: ActivityDescriptions.PROFILE_UPDATED(username),
      metadata: {
        nama,
        username,
        nrp_nip: nrp_nip || undefined,
        profilePictureUpdated: !!(profilePicture && profilePicture.size > 0),
      },
    });

    revalidatePath('/(app)/layout', 'layout');
    return { success: 'Profil berhasil diperbarui.' };

  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return { error: 'Username tersebut sudah digunakan.' };
    }
    console.error('Error updating profile:', error);
    return { error: 'Gagal memperbarui profil.' };
  }
}
```

---

### ✅ Step 3: Update Create User Actions (10 menit)

**File: `src/app/(app)/admin/users/actions.ts`**

**SEBELUM:**
```typescript
// ❌ Tidak berfungsi di Vercel
let profilePictureUrl: string | undefined = undefined;

if (profilePicture && profilePicture.size > 0) {
  const buffer = Buffer.from(await profilePicture.arrayBuffer());
  const filename = `${Date.now()}-${profilePicture.name.replace(/\s/g, '_')}`;
  const uploadPath = path.join(process.cwd(), 'public/uploads/profiles', filename);
  
  await fs.mkdir(path.dirname(uploadPath), { recursive: true });
  await fs.writeFile(uploadPath, buffer);
  profilePictureUrl = `/uploads/profiles/${filename}`;
}
```

**SESUDAH:**
```typescript
// ✅ Berfungsi di Vercel (Base64)
let profilePictureUrl: string | undefined = undefined;

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

### ✅ Step 4: Update Form Component dengan Validasi (5 menit)

**File: `src/app/components/UpdateProfileForm.tsx`**

Tambahkan validasi ukuran file:

```tsx
<input
  type="file"
  id="profilePicture"
  name="profilePicture"
  accept="image/jpeg,image/png,image/jpg,image/webp"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran foto maksimal 2MB');
        e.target.value = '';
        return;
      }
      // Validasi tipe
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Format foto harus JPG, PNG, atau WebP');
        e.target.value = '';
        return;
      }
    }
  }}
  className="mt-1 block w-full text-sm text-gray-900 dark:text-gray-100 
             border border-gray-300 dark:border-gray-600 rounded-lg 
             cursor-pointer bg-gray-50 dark:bg-gray-700 
             focus:outline-none"
/>
<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
  Format: JPG, PNG, atau WebP. Maksimal 2MB.
</p>
```

**File: `src/app/components/UserFormModal.tsx`**

Tambahkan validasi yang sama:

```tsx
<input
  type="file"
  id="profilePicture"
  name="profilePicture"
  accept="image/jpeg,image/png,image/jpg,image/webp"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file && file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 2MB');
      e.target.value = '';
    }
  }}
  className="..."
/>
```

---

### ✅ Step 5: Remove Old Upload Logic (Opsional, Cleanup)

**TIDAK PERLU LAGI:**
```typescript
import fs from 'fs/promises';  // ← Bisa dihapus
import path from 'path';        // ← Bisa dihapus (jika tidak dipakai lagi)
```

Tapi **BIARKAN DULU** sampai semua fitur upload sudah dipindah ke Base64.

---

## 🧪 Testing Checklist

### Test di Localhost:

```bash
# 1. Start development server
npm run dev

# 2. Test upload profile photo
- Login as any user
- Go to Profile page
- Upload foto (< 2MB)
- Submit
- ✅ Foto harus muncul

# 3. Test create user dengan foto
- Login as SUPER_ADMIN
- Go to Admin > Users
- Create new user dengan foto
- ✅ Foto harus tersimpan

# 4. Cek database
npx prisma studio
# Buka table Pengguna
# Kolom profilePictureUrl harus berisi: data:image/jpeg;base64,/9j/4AAQ...
```

### Test di Production:

```bash
# 1. Deploy to Vercel
git add .
git commit -m "Fix: Use Base64 for profile photos (serverless compatible)"
git push origin main

# 2. Wait for deployment (Vercel auto-deploy)
# Check: https://vercel.com/dashboard

# 3. Test upload
- Login ke https://your-app.vercel.app
- Upload profile photo
- ✅ Foto harus muncul
- ✅ Refresh page, foto tetap ada

# 4. Test performance
- Upload foto 500KB → harus cepat (<2s)
- Upload foto 2MB → harus berhasil (<5s)
- Upload foto >2MB → harus ditolak dengan error

# 5. Check database size
- Vercel Dashboard → Storage → Database
- Monitor ukuran tabel Pengguna
- 1 foto 500KB ≈ 700KB di database (Base64 overhead)
```

---

## 📊 Performance Notes

### Base64 vs File Storage:

| Aspect | File Storage | Base64 |
|--------|-------------|--------|
| **Database Size** | Minimal (hanya URL) | +33% overhead |
| **Upload Speed** | Medium | Fast (no disk I/O) |
| **Retrieval Speed** | Fast (CDN) | Slower (DB query) |
| **Bandwidth** | Efficient | Less efficient |
| **Max Recommended Size** | 10MB+ | 2MB |

### Tips Optimasi:

1. **Compress gambar before upload:**
   ```typescript
   // TODO: Add image compression library
   // npm install browser-image-compression
   import imageCompression from 'browser-image-compression';
   
   const compressedFile = await imageCompression(file, {
     maxSizeMB: 0.5,
     maxWidthOrHeight: 800
   });
   ```

2. **Lazy load images:**
   ```tsx
   <Image 
     src={user.profilePictureUrl} 
     loading="lazy"
     placeholder="blur"
     blurDataURL="data:image/jpeg;base64,/9j/2wBDAAYEBQY..." 
   />
   ```

3. **Monitor database size:**
   ```sql
   -- Check table size
   SELECT pg_size_pretty(pg_total_relation_size('Pengguna'));
   ```

---

## 🔄 Migration dari File Storage ke Base64

**Jika sudah ada user dengan foto di `public/uploads/`:**

```typescript
// File: scripts/migrate-images-to-base64.ts
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

async function migrateToBase64() {
  const users = await prisma.pengguna.findMany({
    where: {
      profilePictureUrl: {
        startsWith: '/uploads/'
      }
    }
  });

  for (const user of users) {
    try {
      const filePath = path.join(process.cwd(), 'public', user.profilePictureUrl!);
      const buffer = await fs.readFile(filePath);
      const base64 = buffer.toString('base64');
      
      // Detect MIME type dari extension
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp'
      };
      const mimeType = mimeTypes[ext] || 'image/jpeg';
      
      const base64Url = `data:${mimeType};base64,${base64}`;
      
      await prisma.pengguna.update({
        where: { id: user.id },
        data: { profilePictureUrl: base64Url }
      });
      
      console.log(`✅ Migrated: ${user.username}`);
    } catch (error) {
      console.error(`❌ Failed: ${user.username}`, error);
    }
  }
  
  console.log('✅ Migration complete!');
}

migrateToBase64();
```

**Run migration:**
```bash
npx ts-node scripts/migrate-images-to-base64.ts
```

---

## ⚠️ Limitations & Considerations

### Kapan TIDAK Menggunakan Base64:

1. **Banyak user (>1000) dengan foto**
   - Database akan membengkak
   - Query lambat
   - Backup besar

2. **Foto resolusi tinggi**
   - Base64 tidak efisien untuk >2MB
   - Page load lambat

3. **Butuh image processing (resize, crop, filter)**
   - Base64 harus di-decode dulu
   - Lebih baik pakai Cloudinary/Imgix

### Migrasi ke Cloud Storage (Future):

Jika aplikasi berkembang, migrate ke:
- **Vercel Blob** (recommended untuk Vercel)
- **Cloudinary** (free tier generous)
- **Supabase Storage** (jika pakai Supabase DB)

---

## 📚 Referensi

- [Vercel Serverless Functions Limits](https://vercel.com/docs/functions/limitations)
- [Base64 Encoding Explained](https://developer.mozilla.org/en-US/docs/Glossary/Base64)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)

---

## ✅ Completion Checklist

- [ ] Update `prisma/schema.prisma`
- [ ] Run migration: `npx prisma migrate dev`
- [ ] Update `src/app/(app)/profile/actions.ts`
- [ ] Update `src/app/(app)/admin/users/actions.ts`
- [ ] Add validation to `UpdateProfileForm.tsx`
- [ ] Add validation to `UserFormModal.tsx`
- [ ] Test di localhost
- [ ] Deploy to production
- [ ] Test di production
- [ ] Monitor database size
- [ ] Update documentation

---

**Status:** ✅ READY TO IMPLEMENT  
**Estimated Time:** 30 minutes  
**Risk Level:** 🟢 LOW (reversible change)  
**Dependencies:** None
