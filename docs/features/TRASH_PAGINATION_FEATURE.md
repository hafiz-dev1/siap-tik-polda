# Fitur Paginasi Halaman Kotak Sampah

## 📋 Ringkasan

Menambahkan paginasi pada halaman Kotak Sampah untuk tabel Surat dan Pengguna yang dihapus sementara, dengan implementasi yang konsisten dengan halaman Arsip Surat.

## ✨ Fitur Baru

### 1. **Paginasi Surat di Kotak Sampah**
- ✅ Tabel surat yang dihapus sementara kini memiliki paginasi
- ✅ Tampilan 25, 50, atau 100 item per halaman
- ✅ Navigasi halaman dengan tombol First, Previous, Next, Last
- ✅ Informasi jumlah item yang ditampilkan (contoh: "1-25 dari 100 item")
- ✅ Checkbox select all per halaman
- ✅ Bulk actions tetap berfungsi dengan paginasi

### 2. **Paginasi Pengguna di Kotak Sampah**
- ✅ Tabel pengguna yang dihapus sementara kini memiliki paginasi
- ✅ Tampilan 25, 50, atau 100 item per halaman
- ✅ Navigasi halaman yang sama seperti tabel surat
- ✅ Checkbox select all per halaman
- ✅ Bulk actions tetap berfungsi dengan paginasi

## 📁 File yang Dibuat

### 1. `TrashSuratWithPagination.tsx`
**Lokasi:** `src/app/components/TrashSuratWithPagination.tsx`

Komponen client-side untuk menampilkan tabel surat yang dihapus dengan paginasi:
- Menggunakan `usePagination` hook untuk manajemen paginasi
- Menggunakan `useSelection` hook untuk checkbox dan bulk actions
- Menampilkan komponen `Pagination` untuk kontrol navigasi
- Format tanggal dengan DateTimeFormat Indonesia

**Fitur:**
- Paginasi dengan 25 item per halaman (default)
- Select all per halaman
- Bulk restore/delete
- Format tanggal lengkap dan relatif
- Empty state yang informatif
- Responsive design dengan dark mode support

### 2. `TrashUsersWithPagination.tsx`
**Lokasi:** `src/app/components/TrashUsersWithPagination.tsx`

Komponen client-side untuk menampilkan tabel pengguna yang dihapus dengan paginasi:
- Menggunakan `usePagination` hook untuk manajemen paginasi
- Menggunakan `useSelection` hook untuk checkbox dan bulk actions
- Menampilkan komponen `Pagination` untuk kontrol navigasi
- Menampilkan foto profil atau initial avatar
- Badge role (Super Admin / Admin)

**Fitur:**
- Paginasi dengan 25 item per halaman (default)
- Select all per halaman
- Bulk restore/delete
- Avatar dengan initial jika tidak ada foto profil
- Format tanggal lengkap dan relatif
- Empty state yang informatif
- Responsive design dengan dark mode support

## 🔧 File yang Dimodifikasi

### `trash/page.tsx`
**Lokasi:** `src/app/(app)/admin/trash/page.tsx`

**Perubahan:**
1. Mengganti import dari `TrashSuratTableClient` menjadi `TrashSuratWithPagination`
2. Menambahkan import `TrashUsersWithPagination`
3. Menghapus import `Image` dan `TrashActionButtons` (dipindah ke komponen)
4. Menghapus fungsi `getInitials` (dipindah ke `TrashUsersWithPagination`)
5. Mengganti tabel pengguna statis dengan komponen `TrashUsersWithPagination`
6. Mengganti komponen `TrashSuratTableClient` dengan `TrashSuratWithPagination`

**Struktur Baru:**
```tsx
// Server Component - hanya fetch data
export default async function TrashPage() {
  // ... fetch data
  
  return (
    <div>
      {/* Summary cards */}
      
      {/* Surat Section */}
      <TrashSuratWithPagination deletedSuratList={deletedSuratList} />
      
      {/* Users Section */}
      <TrashUsersWithPagination deletedUsers={deletedUsers} />
    </div>
  );
}
```

## 🎯 Implementasi Detail

### Hooks yang Digunakan

#### 1. `usePagination`
**Lokasi:** `src/app/hooks/usePagination.ts`

Mengelola state dan logika paginasi:
- `currentPageData`: Data untuk halaman saat ini
- `page`: Nomor halaman aktif
- `pageSize`: Jumlah item per halaman (25, 50, atau 100)
- `totalItems`: Total semua item
- `totalPages`: Total halaman
- `setPage`: Fungsi untuk mengubah halaman
- `setPageSize`: Fungsi untuk mengubah jumlah item per halaman

#### 2. `useSelection`
**Lokasi:** `src/app/hooks/useSelection.ts`

Mengelola state checkbox dan selection:
- `selectedIds`: Set ID yang dipilih
- `selectedCount`: Jumlah item yang dipilih
- `selectedArray`: Array ID yang dipilih
- `toggleSelect`: Toggle satu item
- `toggleSelectAll`: Toggle semua item di halaman
- `clearSelection`: Hapus semua selection

### Komponen yang Digunakan

#### `Pagination`
**Lokasi:** `src/app/components/Pagination.tsx`

Komponen UI untuk navigasi paginasi:
- Dropdown untuk memilih jumlah item per halaman (25/50/100)
- Display informasi "X-Y dari Z item"
- Tombol navigasi: First (<<), Previous (<), Next (>), Last (>>)
- Display nomor halaman saat ini
- Disable state untuk tombol yang tidak valid
- Styling yang konsisten dengan design system

#### `BulkTrashActionsToolbar`
**Lokasi:** `src/app/components/BulkTrashActionsToolbar.tsx`

Toolbar untuk bulk actions:
- Tampil saat ada item yang dipilih
- Tombol Restore All untuk memulihkan semua item terpilih
- Tombol Delete All untuk menghapus permanen semua item terpilih
- Konfirmasi sebelum eksekusi aksi
- Support untuk surat dan pengguna

## 🎨 User Experience

### Tampilan Paginasi

```
┌─────────────────────────────────────────────────────────────┐
│ Tampilkan: [25 / halaman ▼]  1-25 dari 150 item            │
│                                                             │
│                     « < Prev  [1 / 6]  Next > »            │
└─────────────────────────────────────────────────────────────┘
```

### Fitur Select All
- Checkbox di header untuk select all **di halaman saat ini**
- Indeterminate state jika beberapa (tapi tidak semua) item dipilih
- Visual feedback dengan background warna berbeda
- Bulk actions toolbar muncul saat ada item terpilih

### Empty State
**Surat:**
```
┌─────────────────────────────────────┐
│           📄 [Icon]                 │
│                                     │
│   Tidak ada surat di kotak sampah.  │
│                                     │
│   Surat yang dihapus akan muncul    │
│   di sini dan dapat dipulihkan      │
│   dalam waktu 30 hari.              │
└─────────────────────────────────────┘
```

**Pengguna:**
```
┌─────────────────────────────────────┐
│           👥 [Icon]                 │
│                                     │
│   Tidak ada akun pengguna di        │
│   kotak sampah.                     │
│                                     │
│   Penghapusan akun hanya boleh      │
│   dilakukan untuk operator yang     │
│   tidak lagi aktif dalam sistem.    │
└─────────────────────────────────────┘
```

## 📊 Format Tanggal

### Format Lengkap
**Indonesia DateTimeFormat:**
```
Senin, 8 Oktober 2025 pukul 14.30
```

### Format Relatif
**Indonesia RelativeTimeFormat:**
```
- "5 menit yang lalu"
- "2 jam yang lalu"
- "kemarin"
- "3 hari yang lalu"
- "minggu lalu"
```

## 🔄 Konsistensi dengan Arsip Surat

Implementasi paginasi di halaman Kotak Sampah mengikuti pola yang sama dengan halaman Arsip Surat:

| Fitur | Arsip Surat | Kotak Sampah |
|-------|-------------|--------------|
| Paginasi | ✅ | ✅ |
| Items per page | 25/50/100 | 25/50/100 |
| Select all per page | ✅ | ✅ |
| Bulk actions | ✅ | ✅ |
| Empty state | ✅ | ✅ |
| Dark mode | ✅ | ✅ |
| Responsive | ✅ | ✅ |

## 🚀 Cara Penggunaan

### Navigasi Halaman
1. Gunakan dropdown untuk memilih jumlah item per halaman (25, 50, atau 100)
2. Klik tombol navigasi untuk berpindah halaman:
   - `«` : Ke halaman pertama
   - `< Prev` : Ke halaman sebelumnya
   - `Next >` : Ke halaman berikutnya
   - `»` : Ke halaman terakhir

### Bulk Actions
1. Centang checkbox di header untuk memilih semua item di halaman saat ini
2. Atau centang checkbox individual untuk item tertentu
3. Toolbar bulk actions akan muncul menampilkan jumlah item terpilih
4. Klik "Pulihkan Semua" atau "Hapus Permanen"
5. Konfirmasi aksi pada dialog yang muncul

### Perubahan PageSize
- Saat mengubah jumlah item per halaman, otomatis kembali ke halaman 1
- Selection akan di-reset
- Data akan dirender ulang sesuai pageSize baru

## 🎯 Manfaat

### 1. **Performa**
- Tidak perlu merender semua item sekaligus
- Lebih cepat untuk dataset besar (>100 items)
- Mengurangi beban DOM

### 2. **User Experience**
- Lebih mudah menavigasi data yang banyak
- Konsisten dengan halaman lain
- Loading lebih cepat per halaman

### 3. **Skalabilitas**
- Dapat menangani ribuan record tanpa lag
- Memory footprint lebih kecil
- Performa konstan terlepas dari jumlah total data

## 🔍 Testing Checklist

- ✅ Paginasi surat berfungsi dengan benar
- ✅ Paginasi pengguna berfungsi dengan benar
- ✅ Select all hanya memilih item di halaman saat ini
- ✅ Bulk actions bekerja dengan item terpilih
- ✅ Navigasi halaman (first, prev, next, last) berfungsi
- ✅ Perubahan pageSize reset ke halaman 1
- ✅ Empty state ditampilkan saat tidak ada data
- ✅ Format tanggal muncul dengan benar (full & relative)
- ✅ Dark mode styling berfungsi
- ✅ Responsive di mobile dan desktop
- ✅ No console errors atau warnings

## 📝 Catatan Teknis

### Client-Side vs Server-Side
- **Server Component** (`page.tsx`): Fetch data dari database
- **Client Component** (`TrashSuratWithPagination`, `TrashUsersWithPagination`): Handle paginasi, selection, dan interaksi user

### State Management
- Paginasi state dikelola oleh `usePagination` hook
- Selection state dikelola oleh `useSelection` hook
- Saat pindah halaman, selection tidak ter-reset (by design pada `useSelection`)
- Bulk actions hanya bekerja pada item yang saat ini dipilih

### Performance Optimization
- `useMemo` untuk calculated data
- `useCallback` untuk event handlers (di komponen Pagination)
- Hanya render item di halaman saat ini
- Auto reset ke halaman 1 saat data atau pageSize berubah

## 🎉 Kesimpulan

Fitur paginasi pada halaman Kotak Sampah telah berhasil diimplementasikan dengan:
- ✅ Konsistensi dengan halaman Arsip Surat
- ✅ UX yang intuitif dan familiar
- ✅ Performa yang optimal
- ✅ Code yang maintainable dan reusable
- ✅ Support untuk dark mode dan responsive design
- ✅ Bulk actions yang tetap berfungsi dengan baik

---

**Tanggal:** 8 Oktober 2025  
**Status:** ✅ Selesai  
**Developer:** GitHub Copilot
