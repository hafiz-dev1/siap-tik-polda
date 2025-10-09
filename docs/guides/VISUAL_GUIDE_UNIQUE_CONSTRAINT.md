# 🎨 Visual Guide: Composite Unique Constraint

## 📊 Diagram Alur Validasi

```
┌─────────────────────────────────────────────────────┐
│          USER INPUT SURAT BARU/EDIT                 │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│   Ekstrak: nomor_surat + tanggal_surat              │
│   Contoh: "001/TIK/X/2025" + "2025-10-01"           │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│   Check Database: Apakah kombinasi sudah ada?       │
│   Query: WHERE nomor_surat = ? AND tanggal = ?      │
└─────────────────┬───────────────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
    ┌────────┐        ┌──────────┐
    │  ADA   │        │ TIDAK ADA│
    │ (Dup)  │        │ (Unik)   │
    └────┬───┘        └────┬─────┘
         │                 │
         ▼                 ▼
    ┌────────────┐    ┌──────────────┐
    │   ERROR!   │    │   SUCCESS!   │
    │ P2002      │    │ Data saved   │
    └────┬───────┘    └──────────────┘
         │
         ▼
    ┌──────────────────────────────────┐
    │ Error Message:                   │
    │ "Kombinasi Nomor Surat dan       │
    │ Tanggal Surat sudah digunakan"   │
    └──────────────────────────────────┘
```

---

## 🔀 Comparison: Before vs After

### BEFORE (Single Unique)

```
┌───────────────────────────────────────────────────┐
│                DATABASE: surat                    │
├────────────────┬──────────────┬──────────────────┤
│ nomor_surat    │ tanggal_surat│ perihal          │
│ (UNIQUE 🔒)    │              │                  │
├────────────────┼──────────────┼──────────────────┤
│ 001/X/2025     │ 2025-01-15   │ Laporan Januari  │
├────────────────┼──────────────┼──────────────────┤
│ 001/X/2025     │ 2025-02-15   │ ❌ DITOLAK!      │
│                │              │ (nomor duplikat) │
└────────────────┴──────────────┴──────────────────┘

Masalah:
❌ Tidak fleksibel
❌ Tidak bisa input surat periodik dengan nomor sama
❌ Tidak bisa handle revisi surat
```

### AFTER (Composite Unique)

```
┌─────────────────────────────────────────────────────────┐
│                DATABASE: surat                          │
├────────────────┬──────────────┬─────────────────────────┤
│ nomor_surat    │ tanggal_surat│ perihal                 │
│ (Composite 🔒) │ (Composite 🔒)│                        │
├────────────────┼──────────────┼─────────────────────────┤
│ 001/X/2025     │ 2025-01-15   │ Laporan Januari ✅      │
├────────────────┼──────────────┼─────────────────────────┤
│ 001/X/2025     │ 2025-02-15   │ Laporan Februari ✅     │
│                │              │ (kombinasi berbeda)     │
├────────────────┼──────────────┼─────────────────────────┤
│ 002/X/2025     │ 2025-01-15   │ Surat Lain ✅           │
│                │              │ (kombinasi berbeda)     │
├────────────────┼──────────────┼─────────────────────────┤
│ 001/X/2025     │ 2025-01-15   │ ❌ DITOLAK!             │
│                │              │ (kombinasi duplikat)    │
└────────────────┴──────────────┴─────────────────────────┘

Keuntungan:
✅ Lebih fleksibel
✅ Support surat periodik
✅ Support revisi surat
✅ Tetap mencegah duplikasi exact
```

---

## 🎯 Use Case Diagram

### Use Case 1: Laporan Bulanan
```
📅 Januari 2025
┌──────────────────────────────────────┐
│ Nomor: 001/LAPORAN/2025              │
│ Tanggal: 2025-01-31                  │
│ Perihal: Laporan Januari             │
│ Status: ✅ SAVED                     │
└──────────────────────────────────────┘

📅 Februari 2025
┌──────────────────────────────────────┐
│ Nomor: 001/LAPORAN/2025              │ ← NOMOR SAMA!
│ Tanggal: 2025-02-28                  │ ← TANGGAL BEDA!
│ Perihal: Laporan Februari            │
│ Status: ✅ SAVED (kombinasi unik)    │
└──────────────────────────────────────┘

📅 Maret 2025
┌──────────────────────────────────────┐
│ Nomor: 001/LAPORAN/2025              │ ← NOMOR SAMA!
│ Tanggal: 2025-03-31                  │ ← TANGGAL BEDA!
│ Perihal: Laporan Maret               │
│ Status: ✅ SAVED (kombinasi unik)    │
└──────────────────────────────────────┘
```

### Use Case 2: Surat Revisi
```
📄 Surat Asli
┌──────────────────────────────────────┐
│ Nomor: SK-001/2025                   │
│ Tanggal: 2025-01-15                  │
│ Perihal: SK Pengangkatan             │
│ Status: ✅ SAVED                     │
└──────────────────────────────────────┘

📄 Surat Revisi
┌──────────────────────────────────────┐
│ Nomor: SK-001/2025                   │ ← NOMOR SAMA!
│ Tanggal: 2025-02-01                  │ ← TANGGAL BEDA!
│ Perihal: SK Pengangkatan (Revisi)    │
│ Status: ✅ SAVED (kombinasi unik)    │
└──────────────────────────────────────┘
```

### Use Case 3: Multiple Surat di Hari yang Sama
```
📅 Tanggal: 2025-10-08 (Hari yang sama)

📄 Surat 1
┌──────────────────────────────────────┐
│ Nomor: 001/TIK/X/2025                │
│ Tanggal: 2025-10-08                  │
│ Status: ✅ SAVED                     │
└──────────────────────────────────────┘

📄 Surat 2
┌──────────────────────────────────────┐
│ Nomor: 002/TIK/X/2025                │ ← NOMOR BEDA!
│ Tanggal: 2025-10-08                  │ ← TANGGAL SAMA!
│ Status: ✅ SAVED (kombinasi unik)    │
└──────────────────────────────────────┘

📄 Surat 3
┌──────────────────────────────────────┐
│ Nomor: 003/TIK/X/2025                │ ← NOMOR BEDA!
│ Tanggal: 2025-10-08                  │ ← TANGGAL SAMA!
│ Status: ✅ SAVED (kombinasi unik)    │
└──────────────────────────────────────┘
```

---

## ⚠️ Error Scenario Diagram

### Scenario: Duplikasi Exact

```
Step 1: Input Surat Pertama
┌──────────────────────────────────────┐
│ Nomor: 001/TIK/X/2025                │
│ Tanggal: 2025-10-01                  │
│ Perihal: Undangan Rapat              │
└──────────────────┬───────────────────┘
                   │
                   ▼
              ✅ TERSIMPAN
                   │
                   ▼
        ┌──────────────────────┐
        │   DATABASE             │
        │ ✓ Kombinasi tersimpan │
        └──────────────────────┘

Step 2: Input Surat Duplikat
┌──────────────────────────────────────┐
│ Nomor: 001/TIK/X/2025                │ ← SAMA!
│ Tanggal: 2025-10-01                  │ ← SAMA!
│ Perihal: Undangan Rapat (copy)       │
└──────────────────┬───────────────────┘
                   │
                   ▼
        ┌─────────────────────────┐
        │  VALIDATION CHECK        │
        │  Kombinasi sudah ada?    │
        │  ✓ Ya, duplikat!         │
        └──────────┬───────────────┘
                   │
                   ▼
              ❌ ERROR!
                   │
                   ▼
        ┌──────────────────────────────────┐
        │ 🔴 Toast Error Message:          │
        │                                  │
        │ "Gagal: Kombinasi Nomor Surat    │
        │ dan Tanggal Surat ini sudah      │
        │ digunakan. Silakan gunakan       │
        │ nomor atau tanggal yang berbeda."│
        └──────────────────────────────────┘
```

---

## 🔍 Database Index Visualization

### Index Structure

```
INDEX: unique_nomor_tanggal
Type: Composite B-Tree Index

┌─────────────────────────────────────────────────────┐
│                  INDEX TREE                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│    "001/TIK/X/2025" + 2025-01-15                   │
│            /                    \                   │
│           /                      \                  │
│  "001/TIK/X/2025"          "002/TIK/X/2025"        │
│   + 2025-02-15              + 2025-01-15           │
│                                                     │
│  ✅ Both allowed                                   │
│  (different combinations)                           │
│                                                     │
└─────────────────────────────────────────────────────┘

Query Performance:
┌──────────────────────────────────────────┐
│ SELECT * FROM surat                      │
│ WHERE nomor_surat = '001/X/2025'         │
│ AND tanggal_surat = '2025-01-15'         │
│                                          │
│ Index Used: ✅ unique_nomor_tanggal      │
│ Speed: O(log n) - Very Fast              │
└──────────────────────────────────────────┘
```

---

## 📱 UI Flow Diagram

### User Journey: Input Surat dengan Validasi

```
┌───────────────────┐
│   FORM INPUT      │
│                   │
│ [Nomor Surat]     │ ← User ketik: "001/TIK/X/2025"
│ [Tanggal Surat]   │ ← User pilih: "2025-10-01"
│ [Perihal]         │
│ [...]             │
│                   │
│ [Simpan]  [Batal] │
└─────────┬─────────┘
          │ User klik "Simpan"
          ▼
┌───────────────────────────┐
│  CLIENT-SIDE VALIDATION   │
│  ✓ Required fields        │
│  ✓ Format validation      │
└─────────┬─────────────────┘
          │
          ▼
┌───────────────────────────┐
│  SUBMIT TO SERVER         │
│  POST /api/surat/create   │
└─────────┬─────────────────┘
          │
          ▼
┌──────────────────────────────┐
│  SERVER ACTION               │
│  createSurat(formData)       │
│                              │
│  Try:                        │
│    prisma.surat.create()     │
│  Catch:                      │
│    if P2002 error            │
│      → return error message  │
└─────────┬────────────────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
┌────────┐  ┌─────────┐
│SUCCESS │  │  ERROR  │
└───┬────┘  └────┬────┘
    │            │
    ▼            ▼
┌────────────┐ ┌──────────────────────┐
│ 🟢 Toast   │ │ 🔴 Toast             │
│ "Berhasil" │ │ "Kombinasi duplikat" │
└────┬───────┘ └──────┬───────────────┘
     │                │
     ▼                ▼
┌─────────────┐  ┌──────────────┐
│ Form Reset  │  │ Form tetap   │
│ Modal Close │  │ User fix it  │
└─────────────┘  └──────────────┘
```

---

## 🎓 Learning Points

### Key Takeaways

```
┌───────────────────────────────────────────────────────┐
│  BEFORE: Single Field Unique                          │
│  ────────────────────────────────────────────────     │
│  🔒 nomor_surat UNIQUE                                │
│                                                       │
│  Pros:                                                │
│  ✅ Simple                                            │
│  ✅ Strict uniqueness                                 │
│                                                       │
│  Cons:                                                │
│  ❌ Not flexible                                      │
│  ❌ Can't reuse nomor with different date             │
│  ❌ Not realistic for some use cases                  │
└───────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│  AFTER: Composite Unique                              │
│  ────────────────────────────────────────────────     │
│  🔒 (nomor_surat + tanggal_surat) UNIQUE              │
│                                                       │
│  Pros:                                                │
│  ✅ Flexible                                          │
│  ✅ Can reuse nomor with different date               │
│  ✅ Realistic for real-world scenarios                │
│  ✅ Still prevents exact duplicates                   │
│                                                       │
│  Cons:                                                │
│  ⚠️  Slightly more complex                            │
│  ⚠️  Users need to understand the rule                │
└───────────────────────────────────────────────────────┘
```

---

## 💼 Business Value

```
┌─────────────────────────────────────────────────────┐
│              BUSINESS IMPACT                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📈 Increased Flexibility                           │
│     ▪ Support periodic reports                      │
│     ▪ Support document revisions                    │
│     ▪ Support multi-branch operations               │
│                                                     │
│  🛡️  Maintained Data Integrity                      │
│     ▪ Prevent exact duplicates                      │
│     ▪ Catch human errors                            │
│     ▪ Clear error messages                          │
│                                                     │
│  ⚡ Better User Experience                          │
│     ▪ Less restrictive                              │
│     ▪ More intuitive                                │
│     ▪ Matches real-world workflow                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Checklist

```
PRE-DEPLOYMENT
□ Schema validated
□ Local testing passed
□ Error messages tested
□ Documentation complete

DEPLOYMENT
□ Backup production database
□ Check for existing duplicates
□ Apply schema changes
□ Verify constraints active

POST-DEPLOYMENT
□ Smoke testing
□ Monitor error logs
□ User acceptance testing
□ Performance monitoring

ROLLBACK PLAN
□ Backup available
□ Rollback script ready
□ Team notified
□ Monitoring active
```

---

**Created:** 2025-10-08  
**Version:** 1.0  
**Status:** ✅ Ready for Implementation
