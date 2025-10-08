# Perbaikan Tampilan Tujuan Disposisi

## Deskripsi Perubahan
Diperbaiki tampilan tujuan disposisi pada "Detail Surat Masuk" agar menampilkan nama lengkap dari tujuan disposisi yang sebenarnya:
- **KASUBBID TEKKOM** (bukan hanya TEKKOM)
- **KASUBBID TEKINFO** (bukan hanya TEKINFO)
- **KASUBBAG RENMIN** (bukan hanya RENMIN)
- **KAUR KEU** (bukan hanya KEU)

### Tampilan
- **Pada Tabel**: Tetap menggunakan singkatan (TEKKOM, TEKINFO, RENMIN, KEU)
- **Pada Detail Modal**: Menggunakan nama lengkap (KASUBBID TEKKOM, KASUBBID TEKINFO, KASUBBAG RENMIN, KAUR KEU)

## File yang Diubah

### 1. `src/app/hooks/useSuratUtils.ts`
**Penambahan**: Fungsi baru `formatDispositionTarget` untuk memformat tujuan disposisi dengan nama lengkap.

```typescript
// Memoized function to format disposition target with full name
const formatDispositionTarget = useCallback((target: string) => {
  const targetMap: Record<string, string> = {
    'KASUBBID_TEKKOM': 'KASUBBID TEKKOM',
    'KASUBBID_TEKINFO': 'KASUBBID TEKINFO',
    'KASUBBAG_RENMIN': 'KASUBBAG RENMIN',
    'KAUR_KEU': 'KAUR KEU'
  };
  return targetMap[target] || formatEnumText(target);
}, [formatEnumText]);
```

**Export**: Menambahkan `formatDispositionTarget` ke return value dari hook `useSuratFormatters`.

### 2. `src/app/components/SuratDetailModal.tsx`
**Penambahan**: Fungsi lokal `formatDispositionTarget` untuk memformat tujuan disposisi.

```typescript
// Fungsi untuk memformat tujuan disposisi dengan nama lengkap
const formatDispositionTarget = (target: string) => {
  const targetMap: Record<string, string> = {
    'KASUBBID_TEKKOM': 'KASUBBID TEKKOM',
    'KASUBBID_TEKINFO': 'KASUBBID TEKINFO',
    'KASUBBAG_RENMIN': 'KASUBBAG RENMIN',
    'KAUR_KEU': 'KAUR KEU'
  };
  return targetMap[target] || formatEnumText(target);
};
```

**Perubahan**: Mengganti `formatEnumText(tujuan)` dengan `formatDispositionTarget(tujuan)` pada tampilan tujuan disposisi di modal.

### 3. `src/app/components/OptimizedSuratDetailModal.tsx`
**Penambahan Props**: Menambahkan prop `formatDispositionTarget` pada interface `OptimizedSuratDetailModalProps`.

```typescript
interface OptimizedSuratDetailModalProps {
  isOpen: boolean;
  surat: SuratWithLampiran | null;
  onClose: () => void;
  formatEnumText: (text: string) => string;
  formatDispositionTarget: (target: string) => string; // ← Prop baru
  getTagColor: (target: string) => string;
}
```

**Perubahan**: Mengganti logic tampilan tujuan disposisi untuk menggunakan `formatDispositionTarget` alih-alih melakukan replace manual pada string.

**Sebelum**:
```typescript
{formatEnumText(
  tujuan
    .replace('KASUBBID_', '')
    .replace('KASUBBAG_', '')
    .replace('KAUR_', '')
)}
```

**Sesudah**:
```typescript
{formatDispositionTarget(tujuan)}
```

### 4. `src/app/components/OptimizedSuratDashboardClientV2.tsx`
**Perubahan**: 
1. Menambahkan `formatDispositionTarget` pada destructuring hook `useSuratFormatters`.
2. Meneruskan prop `formatDispositionTarget` ke komponen `OptimizedSuratDetailModal`.

```typescript
// Mengambil formatDispositionTarget dari hook
const { formatEnumText, getTagColor, formatDate, formatTime, formatDispositionTarget } = useSuratFormatters();

// Meneruskan ke modal
<OptimizedSuratDetailModal
  isOpen={isModalOpen}
  surat={selectedSurat}
  onClose={closeModal}
  formatEnumText={formatEnumText}
  formatDispositionTarget={formatDispositionTarget}
  getTagColor={getTagColor}
/>
```

## Hasil Akhir

### Tabel (Tidak Berubah)
Pada tabel, tujuan disposisi tetap ditampilkan dalam bentuk singkat:
- TEKKOM
- TEKINFO
- RENMIN
- KEU

### Detail Modal (Diperbaiki)
Pada modal detail surat, tujuan disposisi ditampilkan dalam bentuk lengkap:
- KASUBBID TEKKOM
- KASUBBID TEKINFO
- KASUBBAG RENMIN
- KAUR KEU

## Testing
✅ Tidak ada error TypeScript
✅ Komponen modal mendapatkan prop baru `formatDispositionTarget`
✅ Tampilan tabel tetap menggunakan singkatan (tidak terpengaruh)
✅ Tampilan detail modal menggunakan nama lengkap

## Catatan Implementasi
- Fungsi `formatDispositionTarget` dibuat sebagai utility function yang dapat digunakan kembali
- Menggunakan mapping eksplisit untuk memastikan konsistensi penamaan
- Fallback ke `formatEnumText` jika tujuan disposisi tidak ada dalam mapping
- Tidak mengubah logic di tabel agar tetap menampilkan versi singkat
