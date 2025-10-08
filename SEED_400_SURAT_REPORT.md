# ✅ SEED DATABASE: 400 Surat Dummy

**Tanggal:** 8 Oktober 2025  
**Status:** ✅ SELESAI

---

## 📊 Hasil Seeding

### Summary
```
✅ Total Surat         : 400 surat
📎 Total Lampiran      : 400 file (1 lampiran per surat)
📥 Surat Masuk         : 185 surat (46.25%)
📤 Surat Keluar        : 215 surat (53.75%)
```

### Breakdown by Tipe Dokumen
```
📋 NOTA DINAS          : 112 surat (28%)
📋 TELEGRAM            : 101 surat (25.25%)
📋 SPRIN               : 98 surat (24.5%)
📋 SURAT BIASA         : 89 surat (22.25%)
```

---

## 🔧 Perubahan pada Seed Script

### File: `prisma/seed-dummy-surat.ts`

**COUNT diubah dari 100 → 400:**
```typescript
const COUNT = 400;
```

**Logic Seeding diubah dari createMany → loop create:**
- ✅ Sebelumnya: `createMany()` tanpa lampiran
- ✅ Sekarang: Loop `create()` dengan nested lampiran

**Lampiran Dummy ditambahkan:**
```typescript
lampiran: {
  create: {
    nama_file: `scan_surat_${seqSurat}_dummy.pdf`,
    path_file: `/uploads/dummy/scan_${seqSurat}.pdf`,
    tipe_file: 'application/pdf',
    ukuran_file: randomInt(50000, 500000) // 50KB - 500KB
  }
}
```

**Progress Indicator ditambahkan:**
```typescript
if ((i + 1) % 50 === 0) {
  console.log(`Progress: ${i + 1}/${COUNT} surat dibuat...`);
}
```

---

## 📅 Range Data

**Tanggal Surat:** Random dalam 12 bulan terakhir (Oktober 2024 - Oktober 2025)

### Logic Tanggal
- **Surat Masuk:** 
  - `tanggal_surat` dibuat dulu
  - `tanggal_diterima_dibuat` = tanggal_surat + 0-7 hari
  
- **Surat Keluar:**
  - `tanggal_diterima_dibuat` dibuat dulu
  - `tanggal_surat` = tanggal_diterima_dibuat + 0-2 hari

---

## 📋 Data yang Di-generate

### Nomor Agenda
```
Format: AG-2025-XXXX
Range:  AG-2025-0001 s/d AG-2025-0400
```

### Nomor Surat
```
Format: NS/2025/XXXXX
Range:  NS/2025/00001 s/d NS/2025/00400
```

### Perihal (Random dari 10 template)
- Permohonan Data
- Konfirmasi Kegiatan
- Laporan Harian
- Undangan Rapat
- Pemberitahuan Perbaikan Sistem
- Distribusi Informasi
- Permintaan Tindak Lanjut
- Penyampaian Nota Dinas
- Koordinasi Internal
- Update Progres Pekerjaan

### Asal Surat (untuk Surat Masuk)
- Bag Renmin
- Subbid Tekkom
- Subbid Tekinfo
- Kaur Keu
- Eksternal

### Tujuan Surat (Random)
- Kapolda
- Wakapolda
- Kabid TIK
- Kasubbid Tekkom
- Kasubbid Tekinfo

### Tujuan Disposisi (Random 1-3 dari 4)
- KASUBBID_TEKKOM
- KASUBBID_TEKINFO
- KASUBBAG_RENMIN
- KAUR_KEU

### Lampiran
```
Format nama: scan_surat_XXXXX_dummy.pdf
Format path: /uploads/dummy/scan_XXXXX.pdf
Tipe file:   application/pdf
Ukuran:      50KB - 500KB (random)
```

---

## 🚀 Cara Menjalankan Seed

### Generate 400 Surat
```bash
npx tsx prisma/seed-dummy-surat.ts
```

### Verifikasi Hasil
```bash
npx tsx verify-seed.ts
```

### Lihat Data di Prisma Studio
```bash
npx prisma studio
```
Buka browser: http://localhost:5555

---

## 🎯 Use Case

### Testing Performance
- ✅ Uji pagination dengan 400 data
- ✅ Uji sorting dengan dataset besar
- ✅ Uji search/filter dengan banyak record
- ✅ Uji export Excel dengan data lengkap

### Testing UI/UX
- ✅ Tampilan tabel dengan banyak data
- ✅ Loading state dan skeleton
- ✅ Scroll behavior
- ✅ Responsive design dengan data penuh

### Testing Features
- ✅ Bulk delete dengan multiple selection
- ✅ Filter by date range
- ✅ Filter by tipe dokumen
- ✅ Filter by arah surat
- ✅ Search functionality

---

## 📊 Database Impact

### Sebelum Seed
```
Surat    : 0 records
Lampiran : 0 records
```

### Sesudah Seed
```
Surat    : 400 records
Lampiran : 400 records
```

### Storage (Estimated)
```
Database : ~2-3 MB (400 surat + relasi)
Lampiran : ~100-200 MB (400 file dummy metadata)
```

**Note:** Lampiran adalah data dummy (path/metadata saja), file fisik tidak di-generate.

---

## 🧹 Cara Reset/Clean Database

### Hapus Semua Data Surat
```bash
npx prisma studio
# Atau gunakan prisma migrate reset
```

### Prisma Migrate Reset (⚠️ WARNING: Hapus semua data)
```bash
npx prisma migrate reset --force
```

---

## ✅ Checklist

- [x] Ubah COUNT dari 100 ke 400
- [x] Implementasi nested create untuk lampiran
- [x] Tambah progress indicator
- [x] Test seeding process
- [x] Verifikasi data di database
- [x] Cek data di Prisma Studio
- [x] Buat dokumentasi

---

## 📝 Notes

1. **Field Opsional:** Nomor Agenda dan Tanggal Diterima sudah nullable, jadi seed tetap mengisi keduanya untuk data lengkap
2. **Performance:** Seeding 400 data + lampiran selesai dalam < 1 menit
3. **Unique Constraint:** Tidak ada duplikasi nomor_agenda atau kombinasi (nomor_surat, tanggal_surat)
4. **Realistic Data:** Tanggal random dalam 12 bulan terakhir untuk simulasi data real

---

**Status:** ✅ SEEDING COMPLETED SUCCESSFULLY  
**Data Ready:** YES - 400 surat + 400 lampiran
