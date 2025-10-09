# ⚡ Quick Reference: Field Opsional - Nomor Agenda & Tanggal Diterima

## 📌 Ringkasan

**Field yang kini opsional:**
- ✅ **Nomor Agenda** - boleh kosong
- ✅ **Tanggal Diterima** - boleh kosong

**Field yang tetap wajib:**
- ❌ Nomor Surat, Tanggal Surat, Perihal, Asal Surat, Tujuan Surat, dll.

---

## 🎯 Aturan Baru

### ✅ DIIZINKAN

```typescript
// Scenario 1: Semua field diisi
nomor_agenda: "AG-2025-0001"
tanggal_diterima_dibuat: "2025-10-08T10:00"
✅ OK

// Scenario 2: Nomor Agenda kosong
nomor_agenda: "" 
tanggal_diterima_dibuat: "2025-10-08T10:00"
✅ OK (nomor_agenda akan disimpan sebagai null)

// Scenario 3: Tanggal Diterima kosong
nomor_agenda: "AG-2025-0001"
tanggal_diterima_dibuat: ""
✅ OK (tanggal_diterima_dibuat akan disimpan sebagai null)

// Scenario 4: Keduanya kosong
nomor_agenda: ""
tanggal_diterima_dibuat: ""
✅ OK (kedua field akan disimpan sebagai null)
```

---

## 📝 Di Form UI

**Label yang ditampilkan:**
- Nomor Agenda → ada placeholder `(opsional)`
- Tgl Diterima → ada placeholder `(opsional)`

**Validasi:**
- ❌ Tidak ada tanda asterisk `*` (tidak required)
- ✅ Bisa disubmit meskipun kosong

---

## 💾 Di Database

**Schema:**
```sql
nomor_agenda            VARCHAR   UNIQUE   -- Nullable
tanggal_diterima_dibuat TIMESTAMP          -- Nullable
```

**Nilai jika kosong:**
- `NULL` (bukan string kosong `""`)

---

## 📊 Di Tampilan Data

**Jika field bernilai NULL:**
- Tabel → Ditampilkan sebagai `-`
- Export Excel → Ditampilkan sebagai `-`
- Detail Surat → Ditampilkan sebagai `N/A` atau `-`

---

## 🔧 Migration Command

```bash
# Update database schema
npx prisma db push

# Regenerate Prisma Client
npx prisma generate

# Restart development server
npm run dev
```

---

## ✅ Checklist Testing

- [x] Input surat baru tanpa nomor agenda
- [x] Input surat baru tanpa tanggal diterima
- [x] Input surat baru tanpa keduanya
- [x] Edit surat dan kosongkan nomor agenda
- [x] Edit surat dan kosongkan tanggal diterima
- [x] Tampilan tabel menunjukkan `-` untuk field kosong
- [x] Export Excel menunjukkan `-` untuk field kosong
- [x] Sorting masih berfungsi dengan benar

---

## 🎨 Visual Guide

### Form Sebelum (Before)
```
┌────────────────────────────────────┐
│ Nomor Agenda *                     │
│ [____________]                     │  ← Required
│                                    │
│ Tgl Diterima *                     │
│ [____________]                     │  ← Required
└────────────────────────────────────┘
```

### Form Sesudah (After)
```
┌────────────────────────────────────┐
│ Nomor Agenda                       │
│ [_____(opsional)___]               │  ← Optional
│                                    │
│ Tgl Diterima                       │
│ [_____(opsional)___]               │  ← Optional
└────────────────────────────────────┘
```

---

## 💡 Use Case

### Surat Masuk - Input Cepat
```
1. Surat baru diterima
2. Input data utama:
   - Nomor Surat ✓
   - Tanggal Surat ✓
   - Perihal ✓
   - Asal/Tujuan ✓
3. SKIP:
   - Nomor Agenda (akan diisi kemudian)
   - Tanggal Diterima (akan diisi kemudian)
4. Upload scan ✓
5. Submit ✓
```

### Surat Keluar
```
1. Buat surat keluar
2. Input data:
   - Nomor Surat ✓
   - Nomor Agenda ✓
   - Tanggal Surat ✓
3. SKIP:
   - Tanggal Diterima (tidak relevan untuk surat keluar)
4. Submit ✓
```

---

## 📚 File yang Diubah

✅ `prisma/schema.prisma`  
✅ `src/app/components/SuratFormModal.tsx`  
✅ `src/app/(app)/admin/actions.ts`  
✅ `src/app/components/SuratTable.tsx`  
✅ `src/app/components/RecentActivityTable.tsx`  
✅ `src/app/hooks/useSuratUtils.ts`  
✅ `src/app/hooks/useSuratSorting.ts`  
✅ `prisma/seed-dummy-surat.ts`

---

**Status:** ✅ READY FOR USE  
**Last Updated:** 8 Oktober 2025
