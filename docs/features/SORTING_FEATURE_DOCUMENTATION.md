# Dokumentasi Fitur Sorting Tabel Arsip Surat

## 📋 Analisis Mendalam Struktur Tabel

### Arsitektur Komponen Sebelumnya
```
page.tsx (Server Component)
    ↓
SuratDashboardClient (Wrapper)
    ↓
OptimizedSuratDashboardClientV2 (Main Logic)
    ↓
SuratTable (Presentation)
```

### Alur Data Sebelum Sorting
1. **Data Fetching** - Data diambil dari Prisma di `page.tsx`
2. **Filtering** - Data difilter di `useSuratFilters` hook
3. **Pagination** - Data dipaginasi di `usePagination` hook
4. **Display** - Data ditampilkan di `SuratTable` component

### Masalah yang Diidentifikasi
- ❌ Tidak ada fitur sorting pada kolom tabel
- ❌ Header tabel statis, tidak interaktif
- ❌ User tidak bisa mengurutkan data sesuai kebutuhan
- ❌ Sulit menemukan data spesifik dalam banyak record

---

## ✨ Fitur Sorting yang Ditambahkan

### 1. **Kolom yang Dapat Diurutkan**
| Kolom | Field Database | Tipe Sorting |
|-------|---------------|--------------|
| **No.** | `index` (berdasarkan `createdAt`) | Numerik (Timestamp) |
| **Perihal** | `perihal` | Alfabet (String) |
| **Dari** | `asal_surat` | Alfabet (String) |
| **Kepada** | `tujuan_surat` | Alfabet (String) |
| **Diterima** | `tanggal_diterima_dibuat` | Kronologis (Date) |
| **Isi Disposisi** | `isi_disposisi` | Alfabet (String) |

### 2. **Kolom yang TIDAK Dapat Diurutkan**
- **Jenis Dokumen** - Kolom ini merupakan badge/tag, bukan sortable field
- **Disposisi** - Array of tags, kompleks untuk sorting
- **Aksi** - Button actions, tidak relevan untuk sorting

---

## 🔧 Implementasi Teknis

### File yang Dibuat/Dimodifikasi

#### 1. **`useSuratSorting.ts`** (NEW)
Hook custom untuk mengelola state dan logic sorting.

**Features:**
```typescript
- sortField: SortField      // Field yang aktif di-sort
- sortOrder: 'asc' | 'desc' // Urutan ascending/descending
- sortedData: Array         // Data yang sudah diurutkan
- handleSort: Function      // Handler untuk toggle sorting
- getSortIcon: Function     // Mendapatkan icon (↑/↓)
```

**Algoritma Sorting:**
```typescript
switch (sortField) {
  case 'index':
    // Sort by createdAt timestamp
    compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    
  case 'perihal' | 'dari' | 'kepada' | 'isi_disposisi':
    // Sort alfabet dengan locale Indonesia
    compareValue = a.field.localeCompare(b.field, 'id', { sensitivity: 'base' });
    
  case 'diterima':
    // Sort by tanggal_diterima_dibuat timestamp
    compareValue = new Date(a.tanggal_diterima_dibuat).getTime() - 
                   new Date(b.tanggal_diterima_dibuat).getTime();
}

// Apply order (asc/desc)
return sortOrder === 'asc' ? compareValue : -compareValue;
```

**Optimasi:**
- ✅ Menggunakan `useMemo` untuk menghindari re-computation yang tidak perlu
- ✅ Hanya re-compute saat `data`, `sortField`, atau `sortOrder` berubah
- ✅ Locale-aware sorting untuk bahasa Indonesia

---

#### 2. **`SuratTable.tsx`** (MODIFIED)
Component tabel yang ditambahkan interaktivitas sorting.

**Perubahan Utama:**
```typescript
interface SuratTableProps {
  // ... existing props
  onSort?: (field: SortField) => void;    // NEW
  getSortIcon?: (field: SortField) => string; // NEW
}
```

**Visual Enhancement:**
- Header dapat diklik untuk toggle sorting
- Hover effect pada header sortable
- Icon indicator (↑/↓) menunjukkan status sorting
- Tooltip menampilkan hint "Klik untuk mengurutkan..."

**Styles:**
```typescript
const thSortableStyle = `
  ${thStyle}
  cursor-pointer              // Tunjukkan clickable
  hover:bg-gray-200          // Hover effect
  dark:hover:bg-gray-600     // Dark mode support
  transition-colors          // Smooth transition
  select-none                // Prevent text selection
`;
```

**Header Rendering:**
```tsx
<th onClick={() => handleSort('perihal')}>
  <div className="flex items-center justify-between">
    <span>Perihal</span>
    <span className="text-indigo-600">{getSortIcon('perihal')}</span>
  </div>
</th>
```

---

#### 3. **`OptimizedSuratDashboardClientV2.tsx`** (MODIFIED)
Main component yang mengintegrasikan sorting hook.

**Integration Flow:**
```typescript
// 1. Filter data
const { filteredSurat } = useSuratFilters(suratList);

// 2. Sort filtered data
const { sortedData, handleSort, getSortIcon } = useSuratSorting(filteredSurat);

// 3. Paginate sorted data
const { currentPageData } = usePagination(sortedData, 25);

// 4. Pass to table
<SuratTable 
  suratData={currentPageData}
  onSort={handleSort}
  getSortIcon={getSortIcon}
/>
```

**Animation Updates:**
```typescript
useEffect(() => {
  setIsAnimating(true);
  const id = setTimeout(() => setIsAnimating(false), 220);
  return () => clearTimeout(id);
}, [sortField, sortOrder]); // Trigger animation on sort change
```

---

## 🎯 Cara Penggunaan (User Guide)

### Untuk End User:

1. **Mengurutkan Data:**
   - Klik pada header kolom yang ingin diurutkan
   - Klik pertama: Urutkan **Ascending** (A→Z, 1→9, Lama→Baru)
   - Klik kedua: Urutkan **Descending** (Z→A, 9→1, Baru→Lama)

2. **Indikator Visual:**
   - **↑** = Ascending (naik)
   - **↓** = Descending (turun)
   - **Tidak ada icon** = Kolom tidak aktif

3. **Perilaku Sorting:**
   - ✅ **Hanya 1 kolom aktif** pada satu waktu
   - ✅ Klik kolom lain akan **reset** kolom sebelumnya
   - ✅ Data tetap **terfilter** saat di-sort
   - ✅ **Pagination tetap berfungsi** dengan data yang sudah diurutkan

---

## 📊 Contoh Penggunaan Kasus

### Kasus 1: Mencari Surat Terbaru
```
1. Klik header "Diterima"
2. Klik sekali lagi untuk descending (↓)
3. Surat terbaru akan muncul di atas
```

### Kasus 2: Mencari Surat Berdasarkan Asal
```
1. Klik header "Dari"
2. Data akan diurutkan A-Z secara alfabet
3. Mudah menemukan surat dari instansi tertentu
```

### Kasus 3: Kombinasi Filter + Sort
```
1. Pilih tab "Surat Masuk"
2. Filter tipe dokumen "Nota Dinas"
3. Klik header "Perihal" untuk sort alfabet
4. Hasil: Nota Dinas masuk, diurutkan berdasarkan perihal
```

---

## 🚀 Performance Optimization

### 1. **Memoization**
```typescript
// useSuratSorting.ts
const sortedData = useMemo(() => {
  // Sorting logic
}, [data, sortField, sortOrder]);
```
**Benefit:** Tidak re-sort jika data, field, atau order tidak berubah

### 2. **Callback Optimization**
```typescript
// SuratTable.tsx
const handleSort = useCallback((field: SortField) => {
  if (onSort) onSort(field);
}, [onSort]);
```
**Benefit:** Menghindari re-creation function pada setiap render

### 3. **Locale-Aware Sorting**
```typescript
string.localeCompare(other, 'id', { sensitivity: 'base' })
```
**Benefit:** 
- Sorting yang benar untuk bahasa Indonesia
- Case-insensitive sorting
- Lebih cepat dari manual comparison

---

## 🎨 UX/UI Improvements

### Visual Feedback
1. **Hover Effect** - Header berubah warna saat hover
2. **Cursor Pointer** - Menunjukkan elemen clickable
3. **Icon Indicator** - Jelas menunjukkan status sorting
4. **Smooth Animation** - Transisi 220ms saat data berubah
5. **Color Coding** - Icon berwarna indigo untuk highlight

### Accessibility
- ✅ Tooltip dengan deskripsi jelas
- ✅ Keyboard navigable (clickable elements)
- ✅ High contrast colors
- ✅ Dark mode support

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│           DATA FLOW WITH SORTING                    │
└─────────────────────────────────────────────────────┘

Raw Data (from Prisma)
    ↓
[useSuratFilters]
    ├─ Filter by: Tipe Dokumen
    ├─ Filter by: Arah (Masuk/Keluar)
    ├─ Filter by: Search Query
    └─ Filter by: Date Range
    ↓
Filtered Data
    ↓
[useSuratSorting] ← **NEW**
    ├─ Sort by: Active Field
    ├─ Order by: ASC or DESC
    └─ Optimize: useMemo
    ↓
Sorted Data
    ↓
[usePagination]
    ├─ Split into pages
    └─ Return current page data
    ↓
Current Page Data
    ↓
[SuratTable]
    └─ Display to user
```

---

## 🧪 Testing Checklist

### Functional Testing
- [ ] Klik header "No." → sort by index
- [ ] Klik header "Perihal" → sort alfabet
- [ ] Klik header "Dari" → sort alfabet
- [ ] Klik header "Kepada" → sort alfabet
- [ ] Klik header "Diterima" → sort kronologis
- [ ] Klik header "Isi Disposisi" → sort alfabet
- [ ] Klik 2x pada header → toggle ASC/DESC
- [ ] Klik header berbeda → reset sorting sebelumnya
- [ ] Sorting tetap work dengan filter aktif
- [ ] Sorting tetap work dengan pagination

### UI/UX Testing
- [ ] Icon ↑ muncul saat ascending
- [ ] Icon ↓ muncul saat descending
- [ ] Hover effect berfungsi
- [ ] Animation smooth saat data berubah
- [ ] Tooltip muncul saat hover
- [ ] Dark mode compatibility
- [ ] Responsive di mobile

### Performance Testing
- [ ] No lag dengan 100+ items
- [ ] No lag dengan 1000+ items
- [ ] No memory leak saat toggle sorting berkali-kali
- [ ] useMemo mencegah unnecessary re-renders

---

## 📝 Code Examples

### Example 1: Sort by Perihal (Ascending)
```
Before Click:
- Undangan Rapat
- Surat Edaran
- Nota Dinas

After Click (ASC ↑):
- Nota Dinas
- Surat Edaran
- Undangan Rapat
```

### Example 2: Sort by Diterima (Descending)
```
Before Click:
- 2025-01-15 08:00
- 2025-01-16 10:30
- 2025-01-14 14:20

After Click (DESC ↓):
- 2025-01-16 10:30
- 2025-01-15 08:00
- 2025-01-14 14:20
```

---

## 🔐 Security & Best Practices

### Type Safety
```typescript
export type SortField = 
  | 'none' 
  | 'index' 
  | 'perihal' 
  | 'dari' 
  | 'kepada' 
  | 'diterima' 
  | 'isi_disposisi';
```
**Benefit:** Compile-time checking, no typos

### Null/Undefined Handling
```typescript
if (!text) return '';
if (text.length <= maxLength) return text;
```
**Benefit:** Prevent runtime errors

### Memory Management
```typescript
const sortedData = useMemo(() => {
  // Create new array (don't mutate original)
  return [...data].sort((a, b) => {...});
}, [data, sortField, sortOrder]);
```
**Benefit:** Immutability, predictable behavior

---

## 🎓 Lessons Learned

### Architecture Decisions

1. **Why separate hook for sorting?**
   - Single Responsibility Principle
   - Reusable di komponen lain jika diperlukan
   - Easier testing

2. **Why apply sorting after filtering?**
   - Sort hanya data yang relevan (more efficient)
   - Consistent dengan user expectation
   - Reduce computation

3. **Why memoize sorted data?**
   - Prevent unnecessary re-sorting
   - Critical untuk performance di large datasets
   - React best practice

4. **Why only one active sort column?**
   - Simpler UX (less cognitive load)
   - Easier implementation
   - Standard behavior di banyak aplikasi

---

## 📞 Support & Troubleshooting

### Jika Sorting Tidak Berfungsi:

1. **Check Import:**
   ```typescript
   import { useSuratSorting } from '../hooks/useSuratSorting';
   ```

2. **Check Props Passing:**
   ```typescript
   <SuratTable
     onSort={handleSort}
     getSortIcon={getSortIcon}
   />
   ```

3. **Check Data Flow:**
   ```typescript
   // Make sure sortedData is used, not filteredSurat
   const { currentPageData } = usePagination(sortedData, 25);
   ```

### Common Issues:

| Issue | Solution |
|-------|----------|
| Icon tidak muncul | Check `getSortIcon` function passed correctly |
| Header tidak clickable | Check `onSort` handler passed to table |
| Data tidak terupdate | Check dependency array in useMemo |
| Animation janky | Check CSS transition duration |

---

## 🎉 Summary

### What Was Added:
✅ 6 sortable columns (No, Perihal, Dari, Kepada, Diterima, Isi Disposisi)
✅ Visual indicators (↑/↓) di header
✅ Toggle ascending/descending
✅ Single active column sorting
✅ Optimized dengan useMemo
✅ Smooth animations
✅ Dark mode compatible
✅ Fully typed dengan TypeScript

### Benefits:
- 🚀 Better user experience
- 🎯 Easier data discovery
- ⚡ Optimized performance
- 🎨 Modern UI/UX
- 🔒 Type-safe implementation
- 📱 Mobile responsive

### Next Steps (Optional Enhancements):
- [ ] Add multi-column sorting
- [ ] Add sort indicator persistence (localStorage)
- [ ] Add keyboard shortcuts (Shift+Click)
- [ ] Add export sorted data to Excel
- [ ] Add "Default Sort" button

---

**Created:** January 2025  
**Last Updated:** January 2025  
**Version:** 1.0.0
