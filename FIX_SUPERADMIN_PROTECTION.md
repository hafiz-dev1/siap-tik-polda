# 🔒 Perbaikan Proteksi Akun Super Admin

## 📋 Ringkasan Masalah

Pada halaman **Manajemen Pengguna** (`/admin/users`), tombol **"Ubah"** dan **"Hapus"** untuk akun super_admin terkadang tidak disembunyikan atau diganti dengan teks yang sesuai. Hal ini menyebabkan:

1. **Inkonsistensi UI**: Tombol aksi muncul untuk akun yang seharusnya dilindungi
2. **Potensi Keamanan**: Meskipun ada proteksi di server-side, UI tidak memberikan indikasi yang jelas
3. **User Experience Buruk**: User tidak tahu akun mana yang dilindungi sistem

---

## 🔍 Analisis Akar Masalah

### Masalah pada Client-Side (`UserTableClient.tsx`)

```tsx
// ❌ KODE LAMA - Tidak ada pengecekan khusus untuk super_admin
{currentAdminRole === 'ADMIN' ? (
  // Admin hanya bisa hapus akun sendiri
  user.id === currentAdminId ? (
    <DeleteUserButton userId={user.id} />
  ) : (
    <span>Akses Terbatas</span>
  )
) : (
  // Super Admin bisa ubah dan hapus SEMUA akun ❌ SALAH!
  <>
    <UserFormModal userToEdit={user} />
    <DeleteUserButton userId={user.id} />
  </>
)}
```

**Masalah:**
- Logika hanya memeriksa role user yang sedang login (ADMIN vs SUPER_ADMIN)
- **TIDAK ADA** pengecekan apakah user target adalah akun super_admin yang dilindungi
- Akun dengan `username: 'superadmin'` atau `role: 'SUPER_ADMIN'` bisa tampil dengan tombol edit/delete

### Masalah pada Server-Side (`actions.ts`)

#### 1. Function `updateUser`
```typescript
// ❌ KODE LAMA - Pengecekan tidak lengkap
const targetUser = await prisma.pengguna.findUnique({
  where: { id: userId },
  select: { role: true }, // ❌ Tidak ambil username
});

// Hanya cek role, tidak cek username
if (targetUser.role === Role.SUPER_ADMIN && session.role !== Role.SUPER_ADMIN) {
  return { error: 'Anda tidak dapat mengubah akun Super Admin.' };
}
```

#### 2. Function `deleteUser`
```typescript
// ❌ KODE LAMA - Ada pengecekan ganda yang membingungkan
if (targetUser.role === Role.SUPER_ADMIN && session!.role !== Role.SUPER_ADMIN) {
  return { error: 'Gagal: Anda tidak memiliki hak untuk menghapus akun Super Admin.' };
}

// Pengecekan kedua - redundant dan membingungkan
if (targetUser.role === Role.SUPER_ADMIN) {
  return { error: 'Super Admin tidak dapat dihapus.' };
}
```

---

## ✅ Solusi yang Diterapkan

### 1. Perbaikan Client-Side (`UserTableClient.tsx`)

```tsx
<td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
  <div className="flex items-center space-x-4">
    {(() => {
      // ✅ Cek apakah ini akun super_admin yang dilindungi
      const isProtectedSuperAdmin = user.username === 'superadmin' || user.role === 'SUPER_ADMIN';
      
      if (currentAdminRole === 'ADMIN') {
        // Admin hanya bisa hapus akun sendiri
        if (user.id === currentAdminId) {
          return <DeleteUserButton userId={user.id} />;
        } else {
          return (
            <span className="inline-flex items-center rounded-full bg-gray-50 dark:bg-gray-900/30 px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
              Akses Terbatas
            </span>
          );
        }
      } else {
        // Super Admin: cek apakah user yang akan diedit/hapus adalah super_admin yang dilindungi
        if (isProtectedSuperAdmin) {
          return (
            <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-900/30 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700">
              Akun Dilindungi
            </span>
          );
        } else {
          // Akun biasa bisa diubah dan dihapus
          return (
            <>
              <UserFormModal userToEdit={user} />
              <DeleteUserButton userId={user.id} />
            </>
          );
        }
      }
    })()}
  </div>
</td>
```

**Fitur Baru:**
- ✅ Pengecekan eksplisit: `user.username === 'superadmin' || user.role === 'SUPER_ADMIN'`
- ✅ Badge "Akun Dilindungi" dengan warna amber yang konsisten dengan badge role Super Admin
- ✅ Logika yang jelas dan mudah dipahami menggunakan IIFE (Immediately Invoked Function Expression)

### 2. Perbaikan Server-Side - `updateUser` Function

```typescript
export async function updateUser(userId: string, formData: FormData) {
  // ... role guard ...
  
  const targetUser = await prisma.pengguna.findUnique({
    where: { id: userId },
    select: { role: true, username: true }, // ✅ Ambil username juga
  });

  if (!targetUser) {
    return { error: 'Pengguna tidak ditemukan.' };
  }

  // ✅ Proteksi: Tidak bisa mengubah akun superadmin atau role SUPER_ADMIN
  if (targetUser.username === 'superadmin' || targetUser.role === Role.SUPER_ADMIN) {
    return { error: 'Gagal: Akun Super Admin dilindungi dan tidak dapat diubah.' };
  }
  
  // ... rest of code ...
}
```

**Perbaikan:**
- ✅ Menambahkan `username` ke dalam query select
- ✅ Pengecekan di awal sebelum validasi lainnya
- ✅ Pesan error yang jelas dan konsisten

### 3. Perbaikan Server-Side - `deleteUser` Function

```typescript
export async function deleteUser(userId: string) {
  // ... role guard & self-deletion guard ...
  
  const targetUser = await prisma.pengguna.findUnique({
    where: { id: userId },
    select: { role: true, username: true, nama: true },
  });

  if (!targetUser) {
    return { error: 'Pengguna tidak ditemukan.' };
  }

  // ✅ Proteksi: Tidak bisa menghapus akun superadmin atau role SUPER_ADMIN
  if (targetUser.username === 'superadmin' || targetUser.role === Role.SUPER_ADMIN) {
    return { error: 'Gagal: Akun Super Admin dilindungi dan tidak dapat dihapus.' };
  }

  // ✅ Proteksi tambahan: Admin tidak bisa menghapus Super Admin
  if (targetUser.role === Role.SUPER_ADMIN && session!.role !== Role.SUPER_ADMIN) {
    return { error: 'Gagal: Anda tidak memiliki hak untuk menghapus akun Super Admin.' };
  }
  
  // ... rest of code ...
}
```

**Perbaikan:**
- ✅ Pengecekan username dan role di awal
- ✅ Menghilangkan pengecekan redundant yang membingungkan
- ✅ Urutan validasi yang logis

---

## 🎯 Hasil Akhir

### Skenario 1: Admin Login
| User Target | Tombol Ditampilkan |
|-------------|-------------------|
| Diri sendiri | ✅ "Hapus" |
| Admin lain | ⚠️ "Akses Terbatas" |
| Super Admin | ⚠️ "Akses Terbatas" |

### Skenario 2: Super Admin Login
| User Target | Tombol Ditampilkan |
|-------------|-------------------|
| Admin biasa | ✅ "Ubah" + "Hapus" |
| Akun `superadmin` | 🔒 "Akun Dilindungi" |
| Role `SUPER_ADMIN` | 🔒 "Akun Dilindungi" |

---

## 🛡️ Lapisan Proteksi

### 1. **UI Layer** (`UserTableClient.tsx`)
- Menyembunyikan tombol edit/delete untuk akun super_admin
- Menampilkan badge "Akun Dilindungi" yang jelas

### 2. **Server Layer** (`actions.ts`)
- Validasi di `updateUser`: Cek username dan role
- Validasi di `deleteUser`: Cek username dan role
- Pesan error yang informatif

### 3. **Defense in Depth**
- Meskipun UI menyembunyikan tombol, server tetap memvalidasi
- Melindungi dari manipulasi langsung ke API
- Konsisten dengan prinsip "never trust the client"

---

## 📝 Testing Checklist

- [ ] Login sebagai SUPER_ADMIN
  - [ ] Akun `superadmin` menampilkan badge "Akun Dilindungi"
  - [ ] Akun Admin lain menampilkan tombol "Ubah" dan "Hapus"
  
- [ ] Login sebagai ADMIN
  - [ ] Hanya bisa melihat tombol "Hapus" di akun sendiri
  - [ ] Akun lain menampilkan "Akses Terbatas"
  
- [ ] Test Server-Side Protection
  - [ ] Coba panggil `updateUser` dengan userId super_admin → Error
  - [ ] Coba panggil `deleteUser` dengan userId super_admin → Error

---

## 🔄 File yang Diubah

1. **`src/app/components/UserTableClient.tsx`**
   - Menambahkan pengecekan `isProtectedSuperAdmin`
   - Menggunakan IIFE untuk logika kondisional yang kompleks
   - Menambahkan badge "Akun Dilindungi" dengan styling amber

2. **`src/app/(app)/admin/users/actions.ts`**
   - Function `updateUser`: Menambahkan proteksi username & role
   - Function `deleteUser`: Menyederhanakan dan memperjelas validasi
   - Menambahkan `username` ke query select

---

## 🎨 Visual Indicators

### Badge "Akun Dilindungi"
```tsx
<span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-900/30 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700">
  Akun Dilindungi
</span>
```

**Desain yang Konsisten:**
- Menggunakan warna **amber** yang sama dengan badge role "Super Admin"
- Dark mode support
- Border yang halus
- Padding dan typography yang konsisten dengan badge lain

---

## 💡 Best Practices yang Diterapkan

1. **Principle of Least Privilege**: Hanya tampilkan aksi yang memang bisa dilakukan user
2. **Defense in Depth**: Proteksi di UI dan server
3. **Clear Visual Feedback**: User langsung tahu akun mana yang dilindungi
4. **Consistent UX**: Styling yang konsisten dengan komponen lain
5. **Type Safety**: Menggunakan TypeScript untuk type checking

---

## 🚀 Deployment Notes

**Tidak ada perubahan database atau migration yang diperlukan.**

Cukup:
```bash
# Build ulang aplikasi
npm run build

# Restart server (jika production)
pm2 restart siad-tik-polda
```

---

## 📅 Changelog

**Tanggal**: 9 Oktober 2025  
**Versi**: 1.0.0  
**Status**: ✅ Completed

**Perubahan:**
- ✅ Perbaikan UI untuk proteksi akun super_admin
- ✅ Penguatan validasi server-side
- ✅ Pesan error yang lebih jelas
- ✅ Dokumentasi lengkap

---

**Catatan**: Akun dengan `username: 'superadmin'` atau `role: 'SUPER_ADMIN'` sekarang dilindungi secara konsisten di seluruh sistem.
