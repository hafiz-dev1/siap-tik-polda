# 📝 Update: Field Opsional - Nomor Agenda & Tanggal Diterima

**Tanggal:** 8 Oktober 2025  
**Status:** ✅ Implemented  
**Developer:** Hafiz

---

## 📋 Deskripsi Perubahan

Field **Nomor Agenda** dan **Tanggal Diterima** pada form "Tambah Surat" kini bersifat **opsional** (boleh kosong/null). 

### 🎯 Alasan Perubahan

1. **Fleksibilitas Input**: Tidak semua surat memiliki nomor agenda atau tanggal diterima pada saat input awal
2. **Workflow Real**: Sesuai dengan proses bisnis di mana data-data tersebut mungkin diisi kemudian
3. **User Experience**: Mengurangi hambatan saat menginput surat baru

---

## 🔍 Apa yang Berubah?

### Database Schema

**Before:**
```prisma
model Surat {
  nomor_agenda            String     @unique
  tanggal_diterima_dibuat DateTime
  // ...
}
```

**After:**
```prisma
model Surat {
  nomor_agenda            String?    @unique  // ✅ Nullable
  tanggal_diterima_dibuat DateTime?            // ✅ Nullable
  // ...
}
```

### Form UI

**Before:**
- Input `nomor_agenda`: **required** ❌
- Input `tanggal_diterima_dibuat`: **required** ❌

**After:**
- Input `nomor_agenda`: **optional** dengan placeholder "(opsional)" ✅
- Input `tanggal_diterima_dibuat`: **optional** dengan placeholder "(opsional)" ✅

### Server Actions

**Before:**
```typescript
const nomor_agenda = formData.get('nomor_agenda') as string;
const tanggal_diterima_dibuat = new Date(formData.get('tanggal_diterima_dibuat') as string);
```

**After:**
```typescript
const nomor_agenda = (formData.get('nomor_agenda') as string) || null;
const tanggal_diterima_dibuat_raw = formData.get('tanggal_diterima_dibuat') as string;
const tanggal_diterima_dibuat = tanggal_diterima_dibuat_raw ? new Date(tanggal_diterima_dibuat_raw) : null;
```

---

## 📁 File yang Diubah

### 1. **Prisma Schema** (`prisma/schema.prisma`)

```diff
model Surat {
  id                      String     @id @default(uuid())
- nomor_agenda            String     @unique
+ nomor_agenda            String?    @unique
  nomor_surat             String
  tanggal_surat           DateTime
- tanggal_diterima_dibuat DateTime
+ tanggal_diterima_dibuat DateTime?
  // ...
}
```

### 2. **Form Component** (`src/app/components/SuratFormModal.tsx`)

**Perubahan pada field Nomor Agenda:**
```diff
- <input type="text" name="nomor_agenda" id="nomor_agenda" required defaultValue={suratToEdit?.nomor_agenda} />
+ <input type="text" name="nomor_agenda" id="nomor_agenda" defaultValue={suratToEdit?.nomor_agenda || undefined} placeholder="(opsional)" />
```

**Perubahan pada field Tanggal Diterima:**
```diff
- <input type="datetime-local" name="tanggal_diterima_dibuat" id="tanggal_diterima_dibuat" required defaultValue={...} />
+ <input type="datetime-local" name="tanggal_diterima_dibuat" id="tanggal_diterima_dibuat" defaultValue={...} placeholder="(opsional)" />
```

### 3. **Server Actions** (`src/app/(app)/admin/actions.ts`)

**Function `createSurat()`:**
```diff
- const nomor_agenda = formData.get('nomor_agenda') as string;
+ const nomor_agenda = (formData.get('nomor_agenda') as string) || null;

- const tanggal_diterima_dibuat = new Date(formData.get('tanggal_diterima_dibuat') as string);
+ const tanggal_diterima_dibuat_raw = formData.get('tanggal_diterima_dibuat') as string;
+ const tanggal_diterima_dibuat = tanggal_diterima_dibuat_raw ? new Date(tanggal_diterima_dibuat_raw) : null;
```

**Function `updateSurat()`:**
```diff
- const nomor_agenda = formData.get('nomor_agenda') as string;
+ const nomor_agenda = (formData.get('nomor_agenda') as string) || null;

- const tanggal_diterima_dibuat = new Date(formData.get('tanggal_diterima_dibuat') as string);
+ const tanggal_diterima_dibuat_raw = formData.get('tanggal_diterima_dibuat') as string;
+ const tanggal_diterima_dibuat = tanggal_diterima_dibuat_raw ? new Date(tanggal_diterima_dibuat_raw) : null;
```

---

## 🛠️ Cara Update Database

### Development Environment

```bash
# Update schema ke database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### Production Environment

Untuk production, pastikan sudah melakukan backup database terlebih dahulu:

```bash
# Backup database
pg_dump -U username -d database_name > backup_before_optional_fields.sql

# Push schema changes
npx prisma db push

# Generate client
npx prisma generate

# Restart aplikasi
pm2 restart app-name
```

---

## 🧪 Testing Scenarios

### ✅ Scenario 1: Input Surat dengan Semua Field Terisi
```typescript
nomor_agenda: "AG-2025-0001"
tanggal_diterima_dibuat: "2025-10-08T10:00"
nomor_surat: "001/TIK/X/2025"
// ...field lain

// ✅ SUCCESS: Surat tersimpan dengan lengkap
```

### ✅ Scenario 2: Input Surat Tanpa Nomor Agenda
```typescript
nomor_agenda: "" // atau tidak diisi
tanggal_diterima_dibuat: "2025-10-08T10:00"
nomor_surat: "001/TIK/X/2025"
// ...field lain

// ✅ SUCCESS: Surat tersimpan, nomor_agenda = null
```

### ✅ Scenario 3: Input Surat Tanpa Tanggal Diterima
```typescript
nomor_agenda: "AG-2025-0001"
tanggal_diterima_dibuat: "" // atau tidak diisi
nomor_surat: "001/TIK/X/2025"
// ...field lain

// ✅ SUCCESS: Surat tersimpan, tanggal_diterima_dibuat = null
```

### ✅ Scenario 4: Input Surat Tanpa Keduanya
```typescript
nomor_agenda: "" // tidak diisi
tanggal_diterima_dibuat: "" // tidak diisi
nomor_surat: "001/TIK/X/2025"
// ...field lain

// ✅ SUCCESS: Surat tersimpan, kedua field = null
```

### ✅ Scenario 5: Edit Surat - Mengosongkan Field yang Sebelumnya Terisi
```typescript
// Surat lama:
nomor_agenda: "AG-2025-0001"
tanggal_diterima_dibuat: "2025-10-08T10:00"

// Edit menjadi:
nomor_agenda: "" // dikosongkan
tanggal_diterima_dibuat: "" // dikosongkan

// ✅ SUCCESS: Field berubah menjadi null
```

---

## 📊 Validasi yang Tetap Ada

Meskipun `nomor_agenda` dan `tanggal_diterima_dibuat` bersifat opsional, field-field berikut **tetap wajib diisi**:

✅ **Nomor Surat** (nomor_surat) - Required  
✅ **Tanggal Surat** (tanggal_surat) - Required  
✅ **Perihal** (perihal) - Required  
✅ **Asal Surat** (asal_surat) - Required  
✅ **Tujuan Surat** (tujuan_surat) - Required  
✅ **Arah Surat** (arah_surat) - Required  
✅ **Tipe Dokumen** (tipe_dokumen) - Required  
✅ **Tujuan Disposisi** (tujuan_disposisi) - Required  
✅ **Isi Disposisi** (isi_disposisi) - Required  
✅ **Scan Surat** (scan_surat) - Required saat tambah surat baru

### Unique Constraint

⚠️ **Nomor Agenda** - Jika diisi, harus **unique** (tidak boleh duplikat)  
⚠️ **Nomor Surat + Tanggal Surat** - Kombinasi harus **unique** (composite unique constraint)

---

## 💡 Use Cases & Business Logic

### Use Case 1: Input Cepat Surat Masuk
Saat surat baru diterima dan perlu segera diinput, admin dapat:
1. Input data surat utama (nomor surat, tanggal, perihal, dll)
2. **Skip** nomor agenda (akan diisi kemudian)
3. **Skip** tanggal diterima (akan diisi saat validasi)
4. Upload scan surat
5. Submit

### Use Case 2: Update Data Kemudian
Admin dapat kembali ke surat yang sudah diinput dan:
1. Buka form "Ubah Surat"
2. Isi nomor agenda dan tanggal diterima
3. Simpan perubahan

### Use Case 3: Surat Keluar Tanpa Tanggal Diterima
Surat keluar tidak memiliki "tanggal diterima", sehingga field ini wajar dikosongkan:
- Nomor Agenda: Diisi
- Tanggal Diterima: **Dikosongkan** (karena surat keluar)

---

## 🔧 Troubleshooting

### Problem: Form tidak bisa submit meskipun field dikosongkan
**Solution:**
- Pastikan atribut `required` sudah dihapus dari input HTML
- Clear browser cache dan reload halaman

### Problem: Database error "column cannot be null"
**Solution:**
- Pastikan migrasi sudah dijalankan dengan `npx prisma db push`
- Periksa schema.prisma, pastikan field memiliki tanda `?` (nullable)

### Problem: TypeScript error pada Prisma Client
**Solution:**
```bash
npx prisma generate
```

---

## ✅ Checklist Implementasi

- [x] Update `prisma/schema.prisma` - ubah field menjadi nullable
- [x] Run `npx prisma db push` - sync database
- [x] Run `npx prisma generate` - regenerate Prisma Client
- [x] Update `SuratFormModal.tsx` - hapus atribut `required`
- [x] Update `createSurat()` di `actions.ts` - handle null values
- [x] Update `updateSurat()` di `actions.ts` - handle null values
- [x] Testing - input surat dengan field kosong
- [x] Testing - edit surat dan kosongkan field
- [x] Dokumentasi - buat file CHANGELOG

---

## 📝 Catatan Developer

1. **Database Migration**: Menggunakan `db push` karena ada issue dengan shadow database
2. **Backward Compatibility**: Data lama yang memiliki nilai tetap dipertahankan
3. **Unique Constraint**: Nomor Agenda tetap unique jika diisi (null tidak dianggap duplikat di PostgreSQL)
4. **Display Logic**: Pastikan UI menampilkan "-" atau "N/A" untuk field yang null

---

## 📚 Referensi

- [Prisma Optional Fields](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#optional-and-mandatory-fields)
- [PostgreSQL NULL Values](https://www.postgresql.org/docs/current/functions-comparison.html)
- [React Hook Form - Optional Fields](https://react-hook-form.com/api/useform)

---

**Status Implementasi:** ✅ SELESAI  
**Testing:** ✅ PASSED  
**Ready for Production:** ✅ YES
