# 📖 PANDUAN PENGGUNAAN LOG ACTIVITY

## 🎯 Untuk Developer

### Cara Menambahkan Logging ke Fungsi Baru

Setiap kali Anda membuat fungsi yang **mengubah data** (CREATE, UPDATE, DELETE), **WAJIB** tambahkan logging!

#### Step 1: Import
```typescript
import { logActivity, ActivityDescriptions } from '@/lib/activityLogger';
```

#### Step 2: Tambahkan Log di Fungsi
```typescript
export async function namaFungsi(params) {
  const session = await getSession();
  if (!session) return { error: 'Tidak terautentikasi' };
  
  try {
    // ... business logic ...
    
    // TAMBAHKAN LOG DI SINI (setelah operasi sukses)
    await logActivity({
      userId: session!.operatorId,
      category: 'CATEGORY',      // Pilih: AUTH, SURAT, USER, PROFILE, TRASH, SYSTEM
      type: 'TYPE',              // Pilih: CREATE, UPDATE, DELETE, RESTORE, dll
      description: 'Deskripsi aksi yang dilakukan',
      entityType: 'EntityName',  // Optional: nama tabel/model
      entityId: entity.id,       // Optional: ID record
      metadata: {                // Optional: data detail
        key: value,
      },
    });
    
    return { success: 'Berhasil' };
  } catch (error) {
    return { error: 'Gagal' };
  }
}
```

### Categories & Types

#### Categories
- `'AUTH'` - Login, logout, authentication
- `'SURAT'` - Operasi surat (create, update, delete)
- `'USER'` - User management
- `'PROFILE'` - Profile updates
- `'TRASH'` - Restore, permanent delete
- `'SYSTEM'` - System operations

#### Types
- `'CREATE'` - Buat data baru
- `'UPDATE'` - Update data
- `'DELETE'` - Soft delete
- `'RESTORE'` - Restore dari trash
- `'PERMANENT_DELETE'` - Hard delete
- `'BULK_DELETE'` - Bulk soft delete
- `'BULK_RESTORE'` - Bulk restore
- `'BULK_PERMANENT_DELETE'` - Bulk hard delete
- `'LOGIN'` - Login
- `'LOGOUT'` - Logout
- `'CHANGE_PASSWORD'` - Ganti password

### Contoh Lengkap

#### Create Operation
```typescript
export async function createSurat(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: 'Tidak terautentikasi' };
  
  try {
    const nomor_surat = formData.get('nomor_surat') as string;
    const perihal = formData.get('perihal') as string;
    
    const newSurat = await prisma.surat.create({
      data: { nomor_surat, perihal, /* ... */ },
    });
    
    // LOG ACTIVITY
    await logActivity({
      userId: session!.operatorId,
      category: 'SURAT',
      type: 'CREATE',
      description: ActivityDescriptions.SURAT_CREATED(nomor_surat, perihal),
      entityType: 'Surat',
      entityId: newSurat.id,
      metadata: { nomor_surat, perihal },
    });
    
    return { success: 'Surat berhasil dibuat' };
  } catch (error) {
    return { error: 'Gagal membuat surat' };
  }
}
```

#### Update Operation
```typescript
export async function updateUser(userId: string, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: 'Tidak terautentikasi' };
  
  try {
    const nama = formData.get('nama') as string;
    const role = formData.get('role') as string;
    
    await prisma.pengguna.update({
      where: { id: userId },
      data: { nama, role },
    });
    
    // LOG ACTIVITY
    await logActivity({
      userId: session!.operatorId,
      category: 'USER',
      type: 'UPDATE',
      description: ActivityDescriptions.USER_UPDATED(nama, nama),
      entityType: 'Pengguna',
      entityId: userId,
      metadata: { nama, role },
    });
    
    return { success: 'User berhasil diupdate' };
  } catch (error) {
    return { error: 'Gagal update user' };
  }
}
```

#### Bulk Operation
```typescript
export async function deleteBulkSurat(suratIds: string[]) {
  const session = await getSession();
  if (!session) return { error: 'Tidak terautentikasi' };
  
  try {
    await prisma.surat.updateMany({
      where: { id: { in: suratIds } },
      data: { deletedAt: new Date() },
    });
    
    // LOG ACTIVITY
    await logActivity({
      userId: session!.operatorId,
      category: 'SURAT',
      type: 'BULK_DELETE',
      description: `Menghapus ${suratIds.length} surat sekaligus`,
      metadata: {
        count: suratIds.length,
        suratIds,
      },
    });
    
    return { success: `${suratIds.length} surat berhasil dihapus` };
  } catch (error) {
    return { error: 'Gagal menghapus surat' };
  }
}
```

---

## 🎯 Untuk Admin/User

### Cara Melihat Log Activity

1. **Login** ke sistem SIAP
2. Klik **nama Anda** di pojok kanan atas
3. Pilih **"Log Aktivitas"** dari dropdown menu
4. Anda akan melihat halaman Log Activity

### Fitur-fitur di Halaman Log Activity

#### 1. Dashboard Statistics
Melihat ringkasan aktivitas:
- Total aktivitas hari ini
- Total aktivitas minggu ini
- Total aktivitas bulan ini
- Total semua aktivitas

#### 2. Filter
Saring log berdasarkan:
- **Kategori**: Auth, Surat, User, Profile, Trash, System
- **Tipe**: Create, Update, Delete, Restore, dll
- **User**: Pilih user tertentu
- **Status**: Success, Failed, Warning
- **Tanggal**: Dari tanggal - sampai tanggal

#### 3. Search
Cari log berdasarkan:
- Deskripsi aktivitas
- Metadata (detail data)

#### 4. Export
Download log dalam format **CSV** untuk:
- Analisis di Excel
- Backup/arsip
- Reporting
- Audit

### Cara Membaca Log

Setiap log activity menampilkan:
- **Waktu**: Kapan aktivitas dilakukan
- **User**: Siapa yang melakukan
- **Kategori**: Jenis kategori (Auth, Surat, User, dll)
- **Tipe**: Jenis aksi (Create, Update, Delete, dll)
- **Deskripsi**: Detail apa yang dilakukan
- **Status**: Success/Failed/Warning

### Contoh Penggunaan

#### Scenario 1: Investigasi Masalah
"Surat nomor B/123/X/2025 hilang, siapa yang menghapus?"

1. Buka Log Activity
2. Search: "B/123/X/2025"
3. Lihat hasil pencarian
4. Cek user yang melakukan delete
5. Cek timestamp kapan dihapus

#### Scenario 2: Audit Bulanan
"Berapa surat yang dibuat bulan ini?"

1. Buka Log Activity
2. Filter:
   - Kategori: SURAT
   - Tipe: CREATE
   - Tanggal: 1 Nov - 30 Nov 2025
3. Lihat jumlah hasil
4. Export ke CSV untuk report

#### Scenario 3: Monitoring User
"Aktivitas user 'johndoe' hari ini?"

1. Buka Log Activity
2. Filter:
   - User: johndoe
   - Tanggal: Hari ini
3. Lihat semua aktivitas user tersebut

---

## 🚨 Troubleshooting

### Log tidak tercatat
**Masalah:** Melakukan aksi tapi log tidak muncul

**Solusi:**
1. Pastikan Anda sudah login
2. Refresh halaman log activity
3. Clear filter jika ada
4. Check apakah fungsi tersebut sudah ada logging-nya

### Error saat melihat log
**Masalah:** Halaman log activity error

**Solusi:**
1. Refresh halaman
2. Clear browser cache
3. Logout dan login kembali
4. Hubungi developer jika masih error

### Export CSV tidak bekerja
**Masalah:** Tombol export tidak download file

**Solusi:**
1. Check browser popup blocker
2. Allow download dari situs ini
3. Try different browser
4. Check disk space

---

## 📞 Support

### Kontak
- **Developer:** GitHub Copilot
- **Email:** [your-email]
- **Phone:** [your-phone]

### Resources
- **Documentation:** `LOG_ACTIVITY_DOCUMENTATION.md`
- **Quick Reference:** `LOG_ACTIVITY_QUICKREF.md`
- **Tutorial:** `LOG_ACTIVITY_USAGE_GUIDE.md` (this file)

---

## ✅ Best Practices

### Untuk Developer
1. ✅ SELALU tambahkan logging untuk operasi yang mengubah data
2. ✅ Gunakan metadata untuk menyimpan detail penting
3. ✅ Gunakan ActivityDescriptions untuk deskripsi konsisten
4. ✅ Log SETELAH operasi berhasil, bukan sebelum
5. ✅ Jangan log data sensitif (password, token, dll)

### Untuk Admin
1. ✅ Review log activity secara berkala
2. ✅ Export log untuk backup
3. ✅ Investigasi aktivitas mencurigakan
4. ✅ Monitor user activity untuk compliance
5. ✅ Archive old logs setiap bulan

---

**Last Updated:** 9 Oktober 2025  
**Version:** 1.0.0
