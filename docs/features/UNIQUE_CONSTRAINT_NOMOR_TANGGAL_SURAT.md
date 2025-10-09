# 🔐 Implementasi Unique Constraint: Nomor Surat + Tanggal Surat

**Tanggal:** 8 Oktober 2025  
**Status:** ✅ Implemented  
**Developer:** Hafiz

---

## 📋 Deskripsi Perubahan

Sebelumnya, sistem hanya memvalidasi **`nomor_surat`** sebagai unique constraint. Artinya, tidak boleh ada 2 surat dengan nomor yang sama, terlepas dari tanggalnya.

Sekarang, sistem diubah menjadi **composite unique constraint** untuk kombinasi **`nomor_surat` + `tanggal_surat`**.

### 🎯 Tujuan

1. **Fleksibilitas lebih tinggi**: Surat dengan nomor yang sama boleh ada, JIKA tanggalnya berbeda
2. **Data integrity**: Kombinasi nomor + tanggal harus tetap unik untuk mencegah duplikasi
3. **Real-world scenario**: Sesuai dengan kebutuhan kearsipan yang mempertimbangkan waktu

---

## 🔍 Apa yang Berubah?

### Sebelum (Before)
```prisma
model Surat {
  nomor_surat  String  @unique  // ❌ Hanya nomor surat yang unique
  tanggal_surat DateTime
  // ...
}
```

**Contoh Kasus:**
- ✅ Surat A: Nomor `001/X/2025`, Tanggal `2025-01-01`
- ❌ Surat B: Nomor `001/X/2025`, Tanggal `2025-02-15` → **DITOLAK** (nomor duplikat)

### Sesudah (After)
```prisma
model Surat {
  nomor_surat   String      // Removed @unique
  tanggal_surat DateTime
  
  // Composite unique constraint
  @@unique([nomor_surat, tanggal_surat], name: "unique_nomor_tanggal")
  // ...
}
```

**Contoh Kasus:**
- ✅ Surat A: Nomor `001/X/2025`, Tanggal `2025-01-01`
- ✅ Surat B: Nomor `001/X/2025`, Tanggal `2025-02-15` → **DITERIMA** (kombinasi berbeda)
- ✅ Surat C: Nomor `002/X/2025`, Tanggal `2025-01-01` → **DITERIMA** (kombinasi berbeda)
- ❌ Surat D: Nomor `001/X/2025`, Tanggal `2025-01-01` → **DITOLAK** (kombinasi sama dengan Surat A)

---

## 📁 File yang Diubah

### 1. **Prisma Schema** (`prisma/schema.prisma`)

**Perubahan:**
```diff
model Surat {
  id                      String     @id @default(uuid())
  nomor_agenda            String     @unique
- nomor_surat             String     @unique
+ nomor_surat             String     // Removed @unique - now part of composite unique constraint
  tanggal_surat           DateTime
  // ... field lainnya
  
+ // Composite unique constraint: kombinasi nomor_surat + tanggal_surat harus unik
+ @@unique([nomor_surat, tanggal_surat], name: "unique_nomor_tanggal")
  @@map("surat")
}
```

**Penjelasan:**
- Menghapus `@unique` dari `nomor_surat`
- Menambahkan composite constraint `@@unique([nomor_surat, tanggal_surat])`
- Constraint diberi nama `unique_nomor_tanggal` untuk kemudahan debugging

---

### 2. **Server Actions** (`src/app/(app)/admin/actions.ts`)

#### a) Function `createSurat()`

**Perubahan Error Handling:**
```diff
catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    const target = error.meta?.target as string[];
    if (target?.includes('nomor_agenda')) {
      return { error: 'Gagal: Nomor Agenda ini sudah digunakan.' };
    }
    if (target?.includes('nomor_surat')) {
-     return { error: 'Gagal: Nomor Surat ini sudah digunakan.' };
+     return { error: 'Gagal: Kombinasi Nomor Surat dan Tanggal Surat ini sudah digunakan. Silakan gunakan nomor atau tanggal yang berbeda.' };
    }
  }
}
```

#### b) Function `updateSurat()`

**Perubahan Error Handling:**
```diff
catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
+   const target = error.meta?.target as string[];
+   if (target?.includes('nomor_agenda')) {
+     return { error: 'Gagal: Nomor Agenda ini sudah digunakan oleh surat lain.' };
+   }
+   if (target?.includes('nomor_surat')) {
+     return { error: 'Gagal: Kombinasi Nomor Surat dan Tanggal Surat ini sudah digunakan oleh surat lain. Silakan gunakan nomor atau tanggal yang berbeda.' };
+   }
-   return { error: 'Gagal: Nomor Agenda atau Nomor Surat sudah digunakan oleh data lain.' };
+   return { error: 'Gagal: Data duplikat terdeteksi.' };
  }
}
```

**Penjelasan:**
- Error message sekarang lebih informatif dan menjelaskan bahwa **kombinasi** nomor + tanggal yang duplikat
- Memberikan hint kepada user untuk mengubah salah satu field

---

## 🛠️ Cara Migrasi Database

Setelah perubahan schema, jalankan perintah berikut:

```powershell
# 1. Generate migration file
npx prisma migrate dev --name add_composite_unique_nomor_tanggal

# 2. Apply migration ke database
npx prisma migrate deploy

# 3. Regenerate Prisma Client
npx prisma generate
```

**PENTING:** 
- Pastikan tidak ada data duplikat dengan kombinasi `nomor_surat` + `tanggal_surat` yang sama di database sebelum migrasi
- Jika ada, migrasi akan GAGAL. Bersihkan data duplikat terlebih dahulu

---

## 🧪 Testing Scenarios

### ✅ Scenario 1: Input Surat Baru dengan Nomor Sama, Tanggal Beda
```typescript
// Surat 1
nomor_surat: "001/TIK/X/2025"
tanggal_surat: "2025-10-01"
// ✅ SUCCESS

// Surat 2
nomor_surat: "001/TIK/X/2025"
tanggal_surat: "2025-10-15"
// ✅ SUCCESS (tanggal berbeda, kombinasi unik)
```

### ✅ Scenario 2: Input Surat Baru dengan Nomor Beda, Tanggal Sama
```typescript
// Surat 1
nomor_surat: "001/TIK/X/2025"
tanggal_surat: "2025-10-01"
// ✅ SUCCESS

// Surat 2
nomor_surat: "002/TIK/X/2025"
tanggal_surat: "2025-10-01"
// ✅ SUCCESS (nomor berbeda, kombinasi unik)
```

### ❌ Scenario 3: Input Surat Baru dengan Kombinasi yang Sama
```typescript
// Surat 1
nomor_surat: "001/TIK/X/2025"
tanggal_surat: "2025-10-01"
// ✅ SUCCESS

// Surat 2
nomor_surat: "001/TIK/X/2025"
tanggal_surat: "2025-10-01"
// ❌ ERROR: "Gagal: Kombinasi Nomor Surat dan Tanggal Surat ini sudah digunakan..."
```

### ✅ Scenario 4: Edit Surat Tanpa Mengubah Nomor/Tanggal
```typescript
// Edit hanya perihal, asal_surat, dll (nomor & tanggal tetap sama)
// ✅ SUCCESS (tidak ada konflik)
```

### ❌ Scenario 5: Edit Surat Menjadi Kombinasi yang Sudah Ada
```typescript
// Surat A: nomor "001/X/2025", tanggal "2025-10-01"
// Surat B: nomor "002/X/2025", tanggal "2025-10-02"

// Edit Surat B menjadi:
nomor_surat: "001/X/2025"
tanggal_surat: "2025-10-01"
// ❌ ERROR: "Gagal: Kombinasi Nomor Surat dan Tanggal Surat ini sudah digunakan oleh surat lain..."
```

---

## 📊 Validasi yang Tetap Ada

Meskipun `nomor_surat` tidak lagi unique sendiri, validasi lain tetap berlaku:

| Field | Constraint | Keterangan |
|-------|-----------|------------|
| `id` | `@id`, `@default(uuid())` | Primary key, auto-generated |
| `nomor_agenda` | `@unique` | Tetap unik (tidak berubah) |
| **`nomor_surat + tanggal_surat`** | `@@unique(...)` | **Composite unique** ✨ |
| `deletedAt` | Optional | Soft delete tidak mempengaruhi constraint |

---

## 💡 Use Cases & Business Logic

### Kapan kombinasi ini berguna?

1. **Surat Periodik dengan Nomor Sama**
   - Contoh: Laporan bulanan dengan nomor `001/LAP/2025`
   - Januari: `001/LAP/2025` tanggal `2025-01-31`
   - Februari: `001/LAP/2025` tanggal `2025-02-28`
   - ✅ Diizinkan karena tanggal berbeda

2. **Revisi Surat**
   - Surat asli: `SK-001/2025` tanggal `2025-01-15`
   - Surat revisi: `SK-001/2025` tanggal `2025-02-01`
   - ✅ Diizinkan

3. **Multiple Surat di Hari yang Sama**
   - Surat A: `001/X/2025` tanggal `2025-10-01`
   - Surat B: `002/X/2025` tanggal `2025-10-01`
   - ✅ Diizinkan karena nomor berbeda

### Kapan akan ditolak?

❌ Duplikasi exact sama persis:
```
Surat 1: Nomor "001/X/2025", Tanggal "2025-10-01"
Surat 2: Nomor "001/X/2025", Tanggal "2025-10-01"
```
Ini menandakan **human error** atau **intentional duplicate** yang harus dicegah.

---

## 🔧 Troubleshooting

### Error saat Migrasi

**Error:**
```
P2002: Unique constraint failed on the constraint: `unique_nomor_tanggal`
```

**Solusi:**
1. Cek data duplikat:
   ```sql
   SELECT nomor_surat, tanggal_surat, COUNT(*)
   FROM surat
   WHERE "deletedAt" IS NULL
   GROUP BY nomor_surat, tanggal_surat
   HAVING COUNT(*) > 1;
   ```

2. Hapus atau update data duplikat sebelum migrasi
3. Jalankan ulang migration

### Error saat Input Surat Baru

**Error Message:**
```
"Gagal: Kombinasi Nomor Surat dan Tanggal Surat ini sudah digunakan..."
```

**Solusi untuk User:**
- Ubah **nomor surat** ATAU
- Ubah **tanggal surat** ATAU
- Cek apakah surat tersebut memang sudah pernah diinput sebelumnya

---

## 📝 Catatan Developer

1. **Soft Delete Handling**
   - Surat yang sudah dihapus (`deletedAt != null`) TETAP dihitung dalam unique constraint
   - Jika ingin mengabaikan surat yang dihapus, perlu modifikasi constraint di Prisma (complex)
   - Untuk saat ini, kombinasi tetap harus unique meskipun salah satunya sudah dihapus

2. **Performance Impact**
   - Composite unique constraint memiliki index otomatis dari Prisma
   - Query performance untuk pencarian berdasarkan nomor + tanggal akan lebih cepat
   - Tidak ada degradasi performance yang signifikan

3. **Future Improvements**
   - Bisa tambahkan validasi real-time di frontend (cek via API)
   - Bisa tambahkan warning jika user input nomor yang "mirip" dengan yang sudah ada
   - Bisa tambahkan autocomplete untuk nomor surat yang sering digunakan

---

## ✅ Checklist Implementasi

- [x] Update Prisma Schema dengan composite unique constraint
- [x] Update error handling di `createSurat()`
- [x] Update error handling di `updateSurat()`
- [x] Buat dokumentasi lengkap
- [ ] Jalankan database migration
- [ ] Testing manual di development
- [ ] Testing edge cases
- [ ] Deploy ke production

---

## 📚 Referensi

- [Prisma - Composite Unique Constraints](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#unique)
- [Prisma Error Codes](https://www.prisma.io/docs/reference/api-reference/error-reference#p2002)
- Database: PostgreSQL

---

**Perubahan ini meningkatkan fleksibilitas sistem kearsipan sambil tetap menjaga data integrity!** 🎉
