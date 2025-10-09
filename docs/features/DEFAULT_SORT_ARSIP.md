# Default Sort untuk Halaman Arsip Surat

## Ringkasan Perubahan
Telah diimplementasikan default urutan pada tabel surat di halaman arsip surat untuk menampilkan **surat terbaru** terlebih dahulu.

## Detail Teknis

### File yang Dimodifikasi
- `src/app/hooks/useSuratSorting.ts`

### Perubahan yang Dilakukan

#### Before (Sebelum):
```typescript
export function useSuratSorting(data: SuratWithLampiran[]): UseSuratSortingReturn {
  const [sortField, setSortField] = useState<SortField>('none');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
```

#### After (Sesudah):
```typescript
/**
 * Custom hook untuk mengelola sorting data surat
 * Hanya satu kolom yang bisa aktif sorting pada satu waktu
 * Default: urutkan berdasarkan surat terbaru (createdAt desc)
 */
export function useSuratSorting(data: SuratWithLampiran[]): UseSuratSortingReturn {
  const [sortField, setSortField] = useState<SortField>('index');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
```

## Dampak Perubahan

### Halaman yang Terpengaruh
- **Halaman Arsip Surat** (`/arsip`)
  - Komponen: `OptimizedSuratDashboardClientV2`
  - Hook: `useSuratSorting`

### Perilaku Default Baru
1. **Saat pertama kali membuka halaman arsip**, tabel akan otomatis menampilkan surat dengan urutan:
   - **Field**: Berdasarkan waktu pembuatan (`createdAt`)
   - **Order**: Descending (terbaru → terlama)
   - **Visual**: Kolom "No" akan menampilkan icon `↓` menandakan sorting descending aktif

2. **Interaksi pengguna tetap fleksibel**:
   - User masih bisa mengklik header kolom untuk mengubah sorting
   - Klik kolom yang sama akan toggle antara ascending ↑ dan descending ↓
   - Klik kolom berbeda akan mengganti field sorting dengan order ascending

## Keuntungan

✅ **User Experience Lebih Baik**
- Surat terbaru langsung terlihat di bagian atas tabel
- Pengguna tidak perlu klik kolom untuk melihat surat terkini
- Konsisten dengan ekspektasi umum sistem arsip

✅ **Tidak Menghilangkan Fleksibilitas**
- Pengguna tetap bisa custom sorting sesuai kebutuhan
- Semua fitur sorting yang ada tetap berfungsi normal

✅ **Performa Tetap Optimal**
- Menggunakan `useMemo` untuk caching hasil sorting
- Tidak ada overhead tambahan

## Testing

### Cara Verifikasi
1. Buka halaman `/arsip`
2. Periksa urutan surat di tabel
3. Surat dengan tanggal pembuatan terbaru harus berada di baris pertama
4. Icon `↓` harus terlihat di kolom "No"
5. Coba klik header kolom lain untuk memastikan sorting masih fleksibel

### Expected Behavior
- Default: Surat terbaru di atas
- Klik kolom "No": Toggle ke ascending (terlama → terbaru)
- Klik kolom lain: Sorting berubah ke kolom tersebut

## Catatan Tambahan

- Perubahan ini **tidak mempengaruhi** halaman Trash/Kotak Sampah yang memiliki komponen terpisah
- Sorting disimpan dalam state lokal, sehingga akan reset ketika refresh halaman
- Jika diperlukan, sorting preference bisa disimpan ke localStorage di masa depan

---
**Tanggal Implementasi**: 8 Oktober 2025  
**Developer**: Hafiz  
**Status**: ✅ Selesai
