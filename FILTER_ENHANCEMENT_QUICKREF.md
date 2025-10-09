# 🎯 Filter Enhancement - Quick Reference

## 🚀 Fitur Baru (3 Filter)

```
┌─────────────────────────────────────────────────────────────────────┐
│  HALAMAN ARSIP SURAT - FILTER SECTION                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  🔍 [Cari surat (perihal, nomor, asal, tujuan...)         ] [×]    │
│                                                                     │
│  [Surat dari...] [×]  [Kepada...] [×]  [📅 Rentang Tanggal ▼] [Reset] │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 📍 Posisi Filter

### Baris 1: Search Input
- **Full width** di baris pertama
- Clear button (×) muncul saat ada input

### Baris 2: Filter Spesifik
1. **Surat dari** - Filter berdasarkan asal surat
2. **Kepada** - Filter berdasarkan tujuan surat  
3. **Rentang Tanggal** - Dropdown untuk pilih tanggal mulai & akhir
4. **Reset** - Hapus semua filter

## 💡 Cara Pakai

### Filter "Surat dari"
```
Input: "Bagian Umum"
↓
Filter: asal_surat.includes("bagian umum")
↓
Hasil: Hanya surat dari "Bagian Umum"
```

### Filter "Kepada"
```
Input: "Keuangan"
↓
Filter: tujuan_surat.includes("keuangan")
↓
Hasil: Hanya surat ke unit yang mengandung "Keuangan"
```

### Filter "Rentang Tanggal"
```
Klik Button [📅 Rentang Tanggal ▼]
↓
Dropdown muncul:
┌──────────────────────────┐
│ Tanggal Mulai            │
│ [2025-01-01]             │
│                          │
│ Tanggal Akhir            │
│ [2025-01-31]             │
│                          │
│              [Tutup]     │
└──────────────────────────┘
↓
Filter: tanggal_diterima_dibuat between range
↓
Hasil: Surat dalam rentang tanggal
```

## 🔄 Kombinasi Filter

Semua filter menggunakan **AND logic**:

```
┌─────────────────────────────────────────────────┐
│ Surat dari: "Bagian Umum"                       │
│ +                                               │
│ Kepada: "Keuangan"                              │
│ +                                               │
│ Rentang: 2025-01-01 to 2025-01-31              │
└─────────────────────────────────────────────────┘
         ↓
    Filter Logic:
    WHERE asal_surat LIKE "%Bagian Umum%"
    AND tujuan_surat LIKE "%Keuangan%"
    AND tanggal BETWEEN '2025-01-01' AND '2025-01-31'
         ↓
    Hasil yang match SEMUA kriteria
```

## 🎨 Visual States

### Default State (No Filter)
```
[Surat dari...]  [Kepada...]  [📅 Rentang Tanggal]
   ↑ Gray           ↑ Gray         ↑ Gray
```

### Active State (Filter Aktif)
```
[Bagian Umum ×]  [Keuangan ×]  [📅 2025-01-01 — 2025-01-31 ×]  [Reset]
   ↑ Indigo         ↑ Indigo       ↑ Indigo                      ↑ Gray
```

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Focus Search | `Tab` |
| Clear Input | `Esc` (saat focus di input) |
| Open Dropdown | `Click` atau `Enter` |
| Close Dropdown | `Esc` atau `Click outside` |

## 📱 Responsive Behavior

### Desktop (> 768px)
```
[Surat dari (flex-1)] [Kepada (flex-1)] [Tanggal] [Reset]
```

### Mobile (< 768px)
```
[Surat dari (full width)]
[Kepada (full width)]
[Tanggal] [Reset]
```

## 🎯 Contoh Use Case

### Case 1: Audit Surat dari Bagian Tertentu
```
1. Ketik "Bagian Umum" di filter "Surat dari"
2. Pilih rentang tanggal: Januari 2025
3. Hasil: Semua surat dari Bagian Umum di bulan Januari
```

### Case 2: Track Surat ke Unit Spesifik
```
1. Ketik "TEKKOM" di filter "Kepada"
2. Hasil: Semua surat yang ditujukan ke KASUBBID TEKKOM
```

### Case 3: Komunikasi Antar Unit
```
1. "Surat dari": Bagian Perencanaan
2. "Kepada": Bagian Keuangan
3. Hasil: Korespondensi antara kedua unit
```

## 🔧 Technical Details

### Component Tree
```
OptimizedSuratDashboardClientV2
  └── SearchFilters
       ├── Search Input (text)
       ├── Surat Dari Input (text)
       ├── Kepada Input (text)
       ├── DateRangeFilter (dropdown)
       │    ├── Button (toggle)
       │    └── Dropdown Panel
       │         ├── From Date Input
       │         └── To Date Input
       └── Reset Button
```

### State Management
```typescript
// useSuratFilters hook
{
  searchQuery: string,      // Pencarian umum
  suratDari: string,        // ✨ NEW
  kepada: string,           // ✨ NEW
  fromDate: string,         // Digabung di dropdown
  toDate: string,           // Digabung di dropdown
}
```

### Filter Logic Flow
```
User Input
  ↓
State Update (immediate)
  ↓
Debounced Search (300ms for searchQuery)
  ↓
useMemo - filteredSurat
  ↓
Filter Chain:
  1. Type & Direction ✓
  2. Search Query ✓
  3. Date Range ✓
  4. Surat Dari ✓ (NEW)
  5. Kepada ✓ (NEW)
  ↓
Filtered Results
  ↓
Pagination
  ↓
Table Render
```

## 🎨 Styling Classes

### Filter Input
```css
/* Base */
.filter-input {
  min-width: 180px;
  flex: 1;
  border: gray-200;
  dark:border: gray-600;
}

/* With Value */
.filter-input:not(:placeholder-shown) {
  /* Shows clear button */
}
```

### Dropdown Button
```css
/* Default */
.date-button {
  bg: white;
  border: gray-200;
}

/* Active (has date range) */
.date-button.active {
  bg: indigo-50;
  border: indigo-200;
  text: indigo-700;
}
```

## 🐛 Troubleshooting

### Filter tidak bekerja?
- ✅ Cek apakah TypeScript error
- ✅ Pastikan hook return value correct
- ✅ Verify props passed to SearchFilters

### Dropdown tidak close?
- ✅ Event listener terpasang di useEffect
- ✅ dropdownRef.current valid

### Reset tidak bersihkan semua?
- ✅ Cek resetFilters() include semua state
- ✅ Verify all inputs controlled by state

## 📊 Performance Impact

| Metric | Before | After | Impact |
|--------|--------|-------|--------|
| Filter Options | 3 | 5 | +2 filters |
| Re-renders | Normal | Normal | Memoized |
| Filter Speed | Fast | Fast | No change |
| UX Clarity | Good | Better | Improved layout |

---

**Quick Tip:** Gunakan kombinasi filter untuk pencarian yang lebih spesifik! 🎯
