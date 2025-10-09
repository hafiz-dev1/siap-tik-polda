# Update Tata Letak Detail Surat

## Deskripsi Perubahan
Memperbaiki tata letak (layout) pada modal "Detail Surat" agar sesuai dengan desain yang diinginkan dengan tampilan yang lebih konsisten dan profesional.

## Perubahan Layout

### 1. **Grid Layout 2 Kolom yang Konsisten**
**Sebelum**: Menggunakan `grid-cols-1 md:grid-cols-2` (responsive)
**Sesudah**: Menggunakan `grid-cols-2` dengan `gap-x-8 gap-y-3` (fixed 2 kolom)

### 2. **Warna dan Styling**
**Label (Field Names)**:
- Warna: `text-gray-400 dark:text-gray-500` (lebih soft/muted)
- Display: `block mb-1` (label di atas value)

**Value (Data)**:
- Warna: `text-gray-200 dark:text-gray-300` (lebih terang untuk kontras)

### 3. **Spacing yang Lebih Rapat**
- Mengubah `space-y-4` menjadi `space-y-3` untuk spacing yang lebih compact
- Menghapus `mt-1` yang tidak perlu karena sudah menggunakan `mb-1` pada label

### 4. **Tujuan Disposisi Badge**
**Sebelum**: `rounded-full` dengan warna dinamis dari `getTagColor()`
**Sesudah**: `rounded-sm` dengan warna fixed `bg-gray-700 text-gray-200`

### 5. **Isi Disposisi Box**
**Styling Baru**:
```tsx
<div className="bg-gray-700 dark:bg-gray-700/50 p-3 rounded border border-gray-600">
  <p className="text-gray-200 dark:text-gray-300 whitespace-pre-wrap">{surat.isi_disposisi}</p>
</div>
```
- Background: `bg-gray-700`
- Border: `border-gray-600`
- Padding: `p-3`
- Border radius: `rounded` (lebih subtle daripada `rounded-md`)

### 6. **Lampiran Link**
**Sebelum**: Link indigo dengan styling elaborate
**Sesudah**: Link biru sederhana dengan `text-blue-400 hover:underline`

### 7. **Urutan Field yang Dipertahankan**
1. Nomor Agenda
2. Nomor Surat
3. Tanggal Surat
4. Tanggal Diterima/Dibuat (dengan waktu)
5. Asal Surat
6. Tujuan Surat / Kepada
7. Arah
8. Tipe Dokumen
9. **Perihal** (full width)
10. **Tujuan Disposisi** (full width)
11. **Isi Disposisi** (full width, dalam box)
12. **Lampiran** (full width, jika ada)

## File yang Diubah

### 1. `src/app/components/SuratDetailModal.tsx`
**Perubahan**:
- Grid layout dari `grid-cols-1 md:grid-cols-2` → `grid-cols-2`
- Gap dari `gap-x-6 gap-y-3` → `gap-x-8 gap-y-3`
- Label styling: `text-gray-500 dark:text-gray-400` → `text-gray-400 dark:text-gray-500 block mb-1`
- Value styling: `text-gray-900 dark:text-gray-100` → `text-gray-200 dark:text-gray-300`
- Badge tujuan disposisi: `rounded-full bg-gray-100 text-gray-800` → `rounded-sm bg-gray-700 text-gray-200`
- Isi disposisi box: styling yang lebih konsisten dengan border
- Spacing: `space-y-4` → `space-y-3`

### 2. `src/app/components/OptimizedSuratDetailModal.tsx`
**Perubahan yang sama**:
- Konsistensi layout 2 kolom fixed
- Warna dan styling yang disesuaikan
- Badge dan box styling yang sama
- Penghapusan kode duplikasi yang tidak diperlukan

## Detail Perubahan Styling

### Color Palette Baru
```css
/* Labels */
text-gray-400 dark:text-gray-500

/* Values */
text-gray-200 dark:text-gray-300

/* Badge Disposisi */
bg-gray-700 text-gray-200

/* Isi Disposisi Box */
bg-gray-700 border-gray-600

/* Link Lampiran */
text-blue-400 hover:text-blue-300
```

### Spacing & Layout
```css
/* Grid Container */
grid-cols-2 gap-x-8 gap-y-3

/* Overall Spacing */
space-y-3

/* Label Margin */
mb-1
```

## Hasil Akhir

### Tampilan Modal Detail Surat
✅ **Layout 2 kolom yang konsisten** untuk informasi dasar
✅ **Warna yang lebih soft dan professional** dengan gray tones
✅ **Badge tujuan disposisi** dengan rounded-sm dan warna konsisten
✅ **Box isi disposisi** dengan background dan border yang jelas
✅ **Spacing yang lebih compact** tapi tetap readable
✅ **Link lampiran** dengan warna biru yang standart

### Struktur Visual
```
┌─────────────────────────────────────────────────┐
│  Detail Surat Masuk                             │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Nomor Agenda]    [Nomor Surat]               │
│  [Tanggal Surat]   [Tanggal Diterima]          │
│  [Asal Surat]      [Tujuan Surat]              │
│  [Arah]            [Tipe Dokumen]              │
│                                                 │
│  Perihal:                                       │
│  [Isi perihal...]                               │
│                                                 │
│  Tujuan Disposisi:                              │
│  [BADGE] [BADGE] [BADGE]                        │
│                                                 │
│  Isi Disposisi:                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ [Isi disposisi dalam box...]              │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  Lampiran:                                      │
│  [link-file.pdf]                                │
│                                                 │
│                              [Tutup]            │
└─────────────────────────────────────────────────┘
```

## Testing
✅ Tidak ada error TypeScript
✅ Layout 2 kolom konsisten
✅ Warna gray tones teraplikasi dengan baik
✅ Badge dan box styling sesuai desain
✅ Responsive dan readable

## Catatan
- Layout sekarang menggunakan fixed 2 kolom (tidak responsive untuk mobile)
- Jika diperlukan responsive untuk mobile, bisa menambahkan breakpoint `max-md:grid-cols-1`
- Semua warna menggunakan Tailwind's gray palette untuk konsistensi
- Format tanggal tetap menggunakan format Indonesia (id-ID)
