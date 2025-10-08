# ⚡ Quick Reference: Unique Constraint Nomor + Tanggal Surat

## 🎯 Aturan Baru

**KOMBINASI `nomor_surat` + `tanggal_surat` harus UNIK**

### ✅ DIIZINKAN

```typescript
// Surat 1
nomor_surat: "001/TIK/X/2025"
tanggal_surat: "2025-10-01"
✅ OK

// Surat 2 - Nomor sama, tanggal beda
nomor_surat: "001/TIK/X/2025"
tanggal_surat: "2025-10-15"
✅ OK (kombinasi berbeda)

// Surat 3 - Nomor beda, tanggal sama
nomor_surat: "002/TIK/X/2025"
tanggal_surat: "2025-10-01"
✅ OK (kombinasi berbeda)
```

### ❌ DITOLAK

```typescript
// Surat 1
nomor_surat: "001/TIK/X/2025"
tanggal_surat: "2025-10-01"
✅ OK

// Surat 2 - Kombinasi SAMA PERSIS
nomor_surat: "001/TIK/X/2025"
tanggal_surat: "2025-10-01"
❌ ERROR: Kombinasi sudah digunakan!
```

## 🔧 Error Message

Jika duplikat terdeteksi:
```
Gagal: Kombinasi Nomor Surat dan Tanggal Surat ini sudah digunakan. 
Silakan gunakan nomor atau tanggal yang berbeda.
```

## 💡 Solusi

Ubah salah satu:
- **Nomor surat** ATAU
- **Tanggal surat**

## 📊 Constraint yang Ada

| Field | Constraint | Status |
|-------|-----------|--------|
| `id` | Primary Key | ✅ Aktif |
| `nomor_agenda` | Unique | ✅ Aktif |
| `nomor_surat` + `tanggal_surat` | Composite Unique | ✅ **BARU** |

## 🗂️ File yang Diubah

1. ✅ `prisma/schema.prisma` - Schema update
2. ✅ `src/app/(app)/admin/actions.ts` - Error handling
3. ✅ Database - Constraint applied

## 🚀 Status

- [x] Schema updated
- [x] Database migrated (via `db push`)
- [x] Error handling updated
- [x] Documentation created
- [ ] Testing required

---

**Catatan:** Perubahan ini sudah LIVE di database development!
