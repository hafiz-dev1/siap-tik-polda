# ⚡ Quick Reference: Seed 400 Surat

## 📊 Hasil
```
✅ 400 Surat
📎 400 Lampiran
📥 185 Masuk | 📤 215 Keluar
```

## 🚀 Command

### Jalankan Seed
```bash
npx tsx prisma/seed-dummy-surat.ts
```

### Verifikasi
```bash
npx tsx verify-seed.ts
```

### Lihat Data
```bash
npx prisma studio
# http://localhost:5555
```

## 📋 Data Generated

**Nomor Agenda:** AG-2025-0001 → AG-2025-0400  
**Nomor Surat:** NS/2025/00001 → NS/2025/00400  
**Tanggal:** Random 12 bulan terakhir  
**Lampiran:** 1 file dummy per surat

## 🔧 Reset Database
```bash
# ⚠️ WARNING: Hapus semua data
npx prisma migrate reset --force
```

---
**Status:** ✅ READY  
**Last Run:** 8 Oktober 2025
