# Fitur Multiple Checkbox untuk Kotak Sampah

## Deskripsi
Fitur ini menambahkan kemampuan multiple select pada halaman Kotak Sampah untuk melakukan bulk restore (pulihkan) atau bulk delete permanent (hapus permanen) pada surat yang telah dihapus sementara.

## Fitur yang Ditambahkan

### 1. **Checkbox Selection di Trash**
- Checkbox di setiap baris tabel trash untuk memilih surat individual
- Checkbox "Select All" di header untuk memilih/membatalkan semua surat
- Indikator visual (background + border kiri) untuk baris yang dipilih
- Konsisten dengan fitur selection di halaman arsip

### 2. **Bulk Trash Actions Toolbar**
- Toolbar gradient yang muncul ketika ada surat dipilih
- Menampilkan jumlah item yang dipilih
- Dua tombol aksi utama:
  - **Pulihkan** (hijau) - Restore surat ke kondisi aktif
  - **Hapus Permanen** (merah) - Delete permanent dari database
- Tombol "Batal Pilih" untuk membersihkan selection

### 3. **Dual Modal Konfirmasi**

#### Modal Restore:
- Ikon hijau untuk indikasi pulihkan
- Informasi jumlah surat yang akan dipulihkan
- Konfirmasi sebelum restore

#### Modal Delete Permanent:
- Border merah untuk emphasis keamanan
- Warning badge "TIDAK DAPAT dibatalkan"
- Informasi bahwa lampiran juga akan dihapus
- Konfirmasi ganda untuk keamanan

### 4. **Server Actions**
- `restoreBulkSurat()` - Bulk restore multiple surat
- `deleteBulkSuratPermanently()` - Bulk delete permanent dengan hapus lampiran

## File yang Dibuat/Dimodifikasi

### File Baru:

1. **`src/app/components/BulkTrashActionsToolbar.tsx`**
   - Toolbar khusus untuk trash dengan 2 aksi: Restore & Delete Permanent
   - Dual modal konfirmasi
   - Gradient background untuk membedakan dari toolbar arsip

2. **`src/app/components/TrashSuratTableClient.tsx`**
   - Client component untuk tabel trash dengan selection support
   - Integrasi checkbox dan bulk actions
   - State management dengan useSelection hook

### File yang Dimodifikasi:

1. **`src/app/(app)/admin/trash/page.tsx`**
   - Import TrashSuratTableClient
   - Delegasi rendering tabel ke client component
   - Tetap server component untuk data fetching

2. **`src/app/(app)/admin/actions.ts`**
   - Tambah `restoreBulkSurat()` - Restore multiple surat sekaligus
   - Tambah `deleteBulkSuratPermanently()` - Delete permanent dengan hapus lampiran files
   - Role guard ADMIN/SUPER_ADMIN

## Cara Penggunaan

### Bulk Restore (Pulihkan):
1. Buka halaman **Kotak Sampah** (`/admin/trash`)
2. Pilih surat yang ingin dipulihkan dengan checkbox
3. Toolbar muncul dengan tombol hijau **"Pulihkan X surat"**
4. Klik tombol pulihkan
5. Konfirmasi di modal
6. Surat dikembalikan ke arsip aktif

### Bulk Delete Permanent (Hapus Permanen):
1. Buka halaman **Kotak Sampah** (`/admin/trash`)
2. Pilih surat yang ingin dihapus permanen
3. Toolbar muncul dengan tombol merah **"Hapus Permanen"**
4. Klik tombol hapus permanen
5. **PERHATIAN**: Baca warning di modal - aksi tidak dapat dibatalkan
6. Konfirmasi penghapusan
7. Surat dan lampiran terhapus permanen dari server

## Technical Details

### Bulk Restore API
```typescript
export async function restoreBulkSurat(suratIds: string[]) {
  // Role guard: ADMIN/SUPER_ADMIN only
  // Set deletedAt = null untuk semua surat
  // Revalidate path arsip & trash
  // Return success dengan jumlah surat
}
```

### Bulk Delete Permanent API
```typescript
export async function deleteBulkSuratPermanently(suratIds: string[]) {
  // Role guard: ADMIN/SUPER_ADMIN only
  // Ambil semua surat dengan lampiran
  // Hapus files lampiran dari server
  // Delete record dari database
  // Revalidate paths
}
```

### Client Component Structure
```typescript
TrashSuratTableClient
├── useSelection hook
├── BulkTrashActionsToolbar
│   ├── Modal Restore
│   └── Modal Delete Permanent
└── Table dengan checkbox
```

## Design Differences dari Arsip

### Toolbar:
- **Arsip**: Background solid indigo
- **Trash**: Gradient indigo-purple untuk visual distinction

### Actions:
- **Arsip**: Hanya bulk delete (soft delete)
- **Trash**: Dual actions (restore + permanent delete)

### Warnings:
- **Arsip**: Soft delete, bisa dipulihkan
- **Trash**: Permanent delete dengan emphasis warning

### Button Colors:
- **Restore**: Emerald/Green (positive action)
- **Delete Permanent**: Red (destructive action)

## Keamanan & Validasi

### Server-Side:
- ✅ Role-based access control (ADMIN/SUPER_ADMIN)
- ✅ Session verification
- ✅ Input validation (suratIds tidak kosong)
- ✅ Check existence sebelum delete

### Client-Side:
- ✅ Dual confirmation modals
- ✅ Warning badges untuk permanent delete
- ✅ Disabled state management
- ✅ Loading states saat processing

### File Management:
- ✅ Hapus lampiran files dari server saat permanent delete
- ✅ Iterasi semua surat untuk hapus lampiran
- ✅ Error handling untuk file operations

## UX Enhancements

### Visual Feedback:
```
✨ Gradient toolbar untuk distinction
✨ Emerald button untuk restore (positive)
✨ Red button untuk delete (destructive)
✨ Border merah pada modal delete permanent
✨ Warning badge "TIDAK DAPAT dibatalkan"
```

### Interactive States:
```
🎨 Hover effects pada semua buttons
🎨 Active scale animation (press effect)
🎨 Smooth transitions 200ms
🎨 Disabled cursor & states
```

### Accessibility:
```
♿ Keyboard navigation support
♿ Focus states yang jelas
♿ Screen reader friendly labels
♿ Color contrast compliance
```

## Performance

- ✅ Menggunakan Set untuk O(1) lookup
- ✅ Memoized components
- ✅ Efficient bulk operations dengan Prisma
- ✅ Single database transaction
- ✅ Revalidation hanya path yang relevan

## Best Practices Applied

1. **Separation of Concerns**
   - Server component untuk data fetching
   - Client component untuk interactivity
   - Shared hooks untuk reusability

2. **User Safety**
   - Dual confirmation untuk destructive actions
   - Clear warnings dan consequences
   - Visual distinction untuk action severity

3. **Code Reusability**
   - Reuse useSelection hook dari arsip
   - Consistent checkbox styling
   - Shared patterns untuk modals

4. **Error Handling**
   - Try-catch blocks
   - User-friendly error messages
   - Toast notifications

## Future Enhancements

- [ ] Bulk restore untuk akun pengguna (users)
- [ ] Schedule permanent delete (cron job)
- [ ] Export trash items sebelum delete
- [ ] Audit log untuk permanent deletes
- [ ] Undo restore within time window
- [ ] Search & filter di trash table

## Testing Checklist

- [ ] Select single item → toolbar muncul
- [ ] Select all → semua ter-checkbox
- [ ] Bulk restore → surat kembali ke arsip
- [ ] Bulk delete permanent → surat hilang dari DB
- [ ] Lampiran terhapus saat permanent delete
- [ ] Role guard berfungsi (user biasa tidak bisa akses)
- [ ] Toast notification muncul
- [ ] Selection cleared setelah action
- [ ] Modal bisa dibatalkan
- [ ] Loading state saat processing
- [ ] Dark mode compatibility
- [ ] Mobile responsive

---

**Catatan Keamanan**: Permanent delete adalah operasi destruktif yang tidak dapat dibatalkan. Pastikan sudah melakukan backup database sebelum memberikan akses fitur ini ke production.
