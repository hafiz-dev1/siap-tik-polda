# Fitur Multiple Select untuk Hapus Surat

## Deskripsi
Fitur ini menambahkan kemampuan untuk memilih beberapa surat sekaligus dan menghapusnya dalam satu aksi (bulk delete) pada halaman Arsip Surat.

## Fitur yang Ditambahkan

### 1. **Checkbox Selection**
- Checkbox di setiap baris tabel untuk memilih surat individual
- Checkbox "Select All" di header tabel untuk memilih/membatalkan semua surat di halaman saat ini
- Indikator visual (background berwarna) untuk baris yang dipilih
- Checkbox hanya muncul untuk user dengan role ADMIN atau SUPER_ADMIN

### 2. **Bulk Actions Toolbar**
- Toolbar sticky yang muncul di atas tabel ketika ada surat yang dipilih
- Menampilkan jumlah surat yang dipilih
- Tombol "Batal Pilih" untuk menghapus semua pilihan
- Tombol "Hapus X Surat" untuk menghapus semua surat yang dipilih

### 3. **Konfirmasi Bulk Delete**
- Modal konfirmasi yang menampilkan jumlah surat yang akan dihapus
- Informasi bahwa surat akan dipindahkan ke tempat sampah
- Loading state saat proses penghapusan berlangsung

### 4. **Auto Clear Selection**
- Selection otomatis dibersihkan ketika:
  - Pindah halaman pagination
  - Mengubah filter (jenis dokumen, arah surat, tanggal, search)
  - Setelah berhasil melakukan bulk delete

## File yang Dimodifikasi/Ditambahkan

### File Baru:
1. **`src/app/components/BulkActionsToolbar.tsx`**
   - Komponen toolbar untuk bulk actions
   - Menangani UI untuk selection count dan tombol delete

2. **`src/app/hooks/useSelection.ts`**
   - Custom hook untuk mengelola state selection
   - Menyediakan fungsi toggleSelect, toggleSelectAll, dan clearSelection

### File yang Dimodifikasi:
1. **`src/app/components/OptimizedSuratDashboardClientV2.tsx`**
   - Mengintegrasikan useSelection hook
   - Menambahkan BulkActionsToolbar component
   - Meneruskan props selection ke SuratTable

2. **`src/app/components/SuratTable.tsx`**
   - Menambahkan checkbox column di header dan setiap baris
   - Menambahkan props untuk selection handling
   - Styling untuk baris yang dipilih
   - Indeterminate state untuk checkbox "Select All"

3. **`src/app/(app)/admin/actions.ts`**
   - Menambahkan action `deleteBulkSurat` untuk soft delete multiple surat
   - Validasi role ADMIN/SUPER_ADMIN
   - Revalidasi path setelah bulk delete

## Cara Penggunaan

1. **Login sebagai ADMIN atau SUPER_ADMIN**
   - Fitur ini hanya tersedia untuk role ADMIN dan SUPER_ADMIN

2. **Buka halaman Arsip Surat**
   - Navigasi ke `/arsip`

3. **Pilih Surat**
   - Klik checkbox di samping surat yang ingin dihapus
   - Atau klik checkbox di header untuk memilih semua surat di halaman saat ini

4. **Hapus Surat yang Dipilih**
   - Toolbar akan muncul menampilkan jumlah surat yang dipilih
   - Klik tombol "Hapus X Surat"
   - Konfirmasi penghapusan di modal yang muncul

5. **Hasil**
   - Surat yang dipilih akan dipindahkan ke tempat sampah (soft delete)
   - Notifikasi sukses akan muncul
   - Selection otomatis dibersihkan
   - Tabel akan direfresh

## Technical Details

### State Management
```typescript
// Selection state menggunakan Set untuk performa optimal
const {
  selectedIds,        // Set<string> - ID surat yang dipilih
  selectedCount,      // number - Jumlah surat yang dipilih
  selectedArray,      // string[] - Array ID untuk API call
  toggleSelect,       // (id: string) => void
  toggleSelectAll,    // () => void
  clearSelection,     // () => void
} = useSelection(currentPageSurat);
```

### Bulk Delete API
```typescript
// Server action di actions.ts
export async function deleteBulkSurat(suratIds: string[]) {
  // Role guard untuk ADMIN/SUPER_ADMIN
  // Soft delete dengan updateMany
  // Revalidasi path yang relevan
}
```

### Responsive Design
- Toolbar sticky di atas tabel
- Animasi slide-in saat toolbar muncul
- Mobile-friendly layout
- Dark mode support

## Keamanan
- Role-based access control (RBAC)
- Server-side validation
- Session verification
- Hanya ADMIN dan SUPER_ADMIN yang dapat:
  - Melihat checkbox selection
  - Melakukan bulk delete

## Performance
- Menggunakan Set untuk O(1) lookup performance
- Memoized components untuk prevent unnecessary re-renders
- Efficient bulk delete dengan Prisma's updateMany
- Clear selection saat filter change untuk mencegah stale state

## Future Improvements
- [ ] Bulk restore untuk surat di trash
- [ ] Bulk export selected letters
- [ ] Select all across pages
- [ ] Undo functionality
- [ ] Bulk edit operations
