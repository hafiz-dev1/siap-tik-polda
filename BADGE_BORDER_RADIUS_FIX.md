# Perbaikan Border Radius Badge Tujuan Disposisi pada Tabel

## Deskripsi Perubahan
Memperbaiki sudut lengkung (border radius) badge tujuan disposisi pada semua tabel agar konsisten dengan tampilan pada modal detail surat. Perubahan dari `rounded-full` menjadi `rounded-sm` untuk tampilan yang lebih modern dan konsisten.

## Perubahan Border Radius

### Sebelum
```css
rounded-full /* Sudut sangat lengkung, berbentuk pill */
```

### Sesudah
```css
rounded-sm /* Sudut sedikit lengkung, lebih modern */
```

## Visual Comparison

### Sebelum (rounded-full)
```
┌─────────────────────────┐
│ ╭─────────────────────╮ │  ← Sangat lengkung
│ │  KASUBBID TEKKOM    │ │
│ ╰─────────────────────╯ │
└─────────────────────────┘
```

### Sesudah (rounded-sm)
```
┌─────────────────────────┐
│ ┌─────────────────────┐ │  ← Sedikit lengkung
│ │  KASUBBID TEKKOM    │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

## File yang Diubah

### 1. `src/app/components/SuratTable.tsx`
**Perubahan**:
```tsx
// Sebelum
className={`px-1.5 py-0.5 text-xs rounded-full text-[10px] leading-tight ${getTagColor(tujuan)}`}

// Sesudah
className={`px-1.5 py-0.5 text-xs rounded-sm text-[10px] leading-tight ${getTagColor(tujuan)}`}
```

### 2. `src/app/components/RecentActivityTable.tsx`
**Perubahan**:
```tsx
// Sebelum
className="px-1.5 py-0.5 text-xs rounded-full text-[10px] leading-tight bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"

// Sesudah
className="px-1.5 py-0.5 text-xs rounded-sm text-[10px] leading-tight bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
```

### 3. `src/app/components/VirtualizedSuratTable.tsx`
**Perubahan**:
```tsx
// Sebelum
className={`px-1.5 py-0.5 text-xs rounded-full text-[10px] leading-tight ${getTagColor(tujuan)}`}

// Sesudah
className={`px-1.5 py-0.5 text-xs rounded-sm text-[10px] leading-tight ${getTagColor(tujuan)}`}
```

## Konsistensi UI di Seluruh Aplikasi

Sekarang badge tujuan disposisi memiliki border radius yang **konsisten** di semua tempat:

### ✅ Tabel
- `SuratTable.tsx` → `rounded-sm`
- `RecentActivityTable.tsx` → `rounded-sm`
- `VirtualizedSuratTable.tsx` → `rounded-sm`

### ✅ Modal Detail
- `SuratDetailModal.tsx` → `rounded-sm`
- `OptimizedSuratDetailModal.tsx` → `rounded-sm`

## Keuntungan Perubahan

### 1. **Konsistensi Visual**
Semua badge tujuan disposisi di seluruh aplikasi sekarang memiliki border radius yang sama.

### 2. **Tampilan Modern**
`rounded-sm` memberikan kesan yang lebih modern dan profesional dibandingkan `rounded-full`.

### 3. **Diferensiasi yang Jelas**
Badge dengan `rounded-sm` lebih terlihat sebagai label/tag informasi, bukan tombol (yang biasanya menggunakan `rounded-full`).

### 4. **Konsistensi dengan Design System**
Mengikuti prinsip design system dimana komponen yang sama harus memiliki styling yang konsisten.

## Tailwind Border Radius Reference

Untuk referensi:
```css
rounded-none   /* border-radius: 0px; */
rounded-sm     /* border-radius: 0.125rem; (2px) */ ← Digunakan
rounded        /* border-radius: 0.25rem; (4px) */
rounded-md     /* border-radius: 0.375rem; (6px) */
rounded-lg     /* border-radius: 0.5rem; (8px) */
rounded-xl     /* border-radius: 0.75rem; (12px) */
rounded-2xl    /* border-radius: 1rem; (16px) */
rounded-3xl    /* border-radius: 1.5rem; (24px) */
rounded-full   /* border-radius: 9999px; */ ← Sebelumnya
```

## Before & After Screenshot Description

### Before (rounded-full)
Badge terlihat sangat lengkung seperti kapsul/pill, yang biasanya digunakan untuk status atau tombol action.

### After (rounded-sm)
Badge terlihat lebih seperti label/tag informasi dengan sudut yang sedikit melengkung, memberikan kesan yang lebih modern dan profesional.

## Testing
✅ Tidak ada error TypeScript
✅ Border radius konsisten di semua tabel
✅ Border radius konsisten dengan modal detail
✅ Visual lebih modern dan profesional
✅ Tidak mengubah fungsionalitas, hanya styling

## Catatan Implementasi
- Perubahan hanya pada class CSS `rounded-full` → `rounded-sm`
- Tidak ada perubahan pada logika atau fungsionalitas
- Semua properti lain (padding, text size, colors) tetap sama
- Perubahan bersifat visual saja untuk meningkatkan konsistensi UI

## Rekomendasi
Jika di masa depan ingin menggunakan border radius yang berbeda untuk semua badge, cukup ubah semua `rounded-sm` menjadi nilai yang diinginkan (misalnya `rounded`, `rounded-md`, dll) secara serentak di semua file yang telah diubah.
