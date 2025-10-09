# 🔧 HOW TO ADD LOGGING - Copy-Paste Examples

Panduan praktis untuk menambahkan logging ke fungsi-fungsi yang belum memiliki tracking.

---

## 📦 Template Dasar

### 1. Import Library
```typescript
import { logActivity, ActivityDescriptions } from '@/lib/activityLogger';
```

---

## 📝 SURAT Operations

### Update Surat
```typescript
export async function updateSurat(suratId: string, formData: FormData) {
  const session = await getSession();
  // ... validation code ...

  try {
    const existingSurat = await prisma.surat.findUnique({
      where: { id: suratId },
      select: { nomor_surat: true, perihal: true },
    });

    // ... update logic ...
    const updatedSurat = await prisma.surat.update({
      where: { id: suratId },
      data: { /* ... */ },
    });

    // ✅ ADD THIS: Log activity
    await logActivity({
      userId: session.operatorId,
      category: 'SURAT',
      type: 'UPDATE',
      description: ActivityDescriptions.SURAT_UPDATED(updatedSurat.nomor_surat),
      entityType: 'Surat',
      entityId: suratId,
      metadata: {
        nomor_surat: updatedSurat.nomor_surat,
        perihal: updatedSurat.perihal,
      },
    });

    return { success: 'Surat berhasil diupdate.' };
  } catch (error) {
    // ... error handling ...
  }
}
```

### Restore Surat
```typescript
export async function restoreSurat(suratId: string) {
  const session = await getSession();
  // ... validation code ...

  try {
    const surat = await prisma.surat.findUnique({
      where: { id: suratId },
      select: { nomor_surat: true },
    });

    await prisma.surat.update({
      where: { id: suratId },
      data: { deletedAt: null },
    });

    // ✅ ADD THIS: Log activity
    if (surat) {
      await logActivity({
        userId: session.operatorId,
        category: 'TRASH',
        type: 'RESTORE',
        description: ActivityDescriptions.SURAT_RESTORED(surat.nomor_surat),
        entityType: 'Surat',
        entityId: suratId,
        metadata: { nomor_surat: surat.nomor_surat },
      });
    }

    return { success: 'Surat berhasil dipulihkan.' };
  } catch (error) {
    // ... error handling ...
  }
}
```

### Permanent Delete Surat
```typescript
export async function deleteSuratPermanently(suratId: string) {
  const session = await getSession();
  // ... validation code ...

  try {
    const surat = await prisma.surat.findUnique({
      where: { id: suratId },
      select: { nomor_surat: true, lampiran: true },
    });

    // Delete lampiran files
    if (surat?.lampiran) {
      await removeLampiranFiles(surat.lampiran);
    }

    await prisma.surat.delete({
      where: { id: suratId },
    });

    // ✅ ADD THIS: Log activity
    if (surat) {
      await logActivity({
        userId: session.operatorId,
        category: 'TRASH',
        type: 'PERMANENT_DELETE',
        description: ActivityDescriptions.SURAT_PERMANENT_DELETE(surat.nomor_surat),
        entityType: 'Surat',
        entityId: suratId,
        metadata: { nomor_surat: surat.nomor_surat },
      });
    }

    return { success: 'Surat berhasil dihapus permanen.' };
  } catch (error) {
    // ... error handling ...
  }
}
```

### Bulk Delete Surat
```typescript
export async function deleteBulkSurat(suratIds: string[]) {
  const session = await getSession();
  // ... validation code ...

  try {
    await prisma.surat.updateMany({
      where: { id: { in: suratIds } },
      data: { deletedAt: new Date() },
    });

    // ✅ ADD THIS: Log activity
    await logActivity({
      userId: session.operatorId,
      category: 'SURAT',
      type: 'BULK_DELETE',
      description: ActivityDescriptions.SURAT_BULK_DELETE(suratIds.length),
      metadata: { count: suratIds.length, suratIds },
    });

    return { success: `${suratIds.length} surat berhasil dihapus.` };
  } catch (error) {
    // ... error handling ...
  }
}
```

### Bulk Restore Surat
```typescript
export async function restoreBulkSurat(suratIds: string[]) {
  const session = await getSession();
  // ... validation code ...

  try {
    await prisma.surat.updateMany({
      where: { id: { in: suratIds } },
      data: { deletedAt: null },
    });

    // ✅ ADD THIS: Log activity
    await logActivity({
      userId: session.operatorId,
      category: 'TRASH',
      type: 'BULK_RESTORE',
      description: ActivityDescriptions.SURAT_BULK_RESTORE(suratIds.length),
      metadata: { count: suratIds.length, suratIds },
    });

    return { success: `${suratIds.length} surat berhasil dipulihkan.` };
  } catch (error) {
    // ... error handling ...
  }
}
```

### Bulk Permanent Delete Surat
```typescript
export async function deleteBulkSuratPermanently(suratIds: string[]) {
  const session = await getSession();
  // ... validation code ...

  try {
    // Get lampiran to delete files
    const surats = await prisma.surat.findMany({
      where: { id: { in: suratIds } },
      include: { lampiran: true },
    });

    // Delete all lampiran files
    for (const surat of surats) {
      await removeLampiranFiles(surat.lampiran);
    }

    // Delete from database
    await prisma.surat.deleteMany({
      where: { id: { in: suratIds } },
    });

    // ✅ ADD THIS: Log activity
    await logActivity({
      userId: session.operatorId,
      category: 'TRASH',
      type: 'BULK_PERMANENT_DELETE',
      description: ActivityDescriptions.SURAT_BULK_PERMANENT_DELETE(suratIds.length),
      metadata: { count: suratIds.length, suratIds },
    });

    return { success: `${suratIds.length} surat berhasil dihapus permanen.` };
  } catch (error) {
    // ... error handling ...
  }
}
```

---

## 👤 USER Operations

### Create User
```typescript
export async function createUser(formData: FormData) {
  const session = await getSession();
  // ... validation code ...

  try {
    const username = formData.get('username') as string;
    const nama = formData.get('nama') as string;
    // ... other fields ...

    const newUser = await prisma.pengguna.create({
      data: { /* ... */ },
    });

    // ✅ ADD THIS: Log activity
    await logActivity({
      userId: session.operatorId,
      category: 'USER',
      type: 'CREATE',
      description: ActivityDescriptions.USER_CREATED(username, nama),
      entityType: 'User',
      entityId: newUser.id,
      metadata: { username, nama, role: newUser.role },
    });

    return { success: 'User berhasil dibuat.' };
  } catch (error) {
    // ... error handling ...
  }
}
```

### Update User
```typescript
export async function updateUser(userId: string, formData: FormData) {
  const session = await getSession();
  // ... validation code ...

  try {
    const updatedUser = await prisma.pengguna.update({
      where: { id: userId },
      data: { /* ... */ },
    });

    // ✅ ADD THIS: Log activity
    await logActivity({
      userId: session.operatorId,
      category: 'USER',
      type: 'UPDATE',
      description: ActivityDescriptions.USER_UPDATED(updatedUser.username),
      entityType: 'User',
      entityId: userId,
      metadata: { username: updatedUser.username },
    });

    return { success: 'User berhasil diupdate.' };
  } catch (error) {
    // ... error handling ...
  }
}
```

### Delete User
```typescript
export async function deleteUser(userId: string) {
  const session = await getSession();
  // ... validation code ...

  try {
    const user = await prisma.pengguna.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    await prisma.pengguna.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    // ✅ ADD THIS: Log activity
    if (user) {
      await logActivity({
        userId: session.operatorId,
        category: 'USER',
        type: 'DELETE',
        description: ActivityDescriptions.USER_DELETED(user.username),
        entityType: 'User',
        entityId: userId,
        metadata: { username: user.username },
      });
    }

    return { success: 'User berhasil dihapus.' };
  } catch (error) {
    // ... error handling ...
  }
}
```

### Restore User
```typescript
export async function restoreUser(userId: string) {
  const session = await getSession();
  // ... validation code ...

  try {
    const user = await prisma.pengguna.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    await prisma.pengguna.update({
      where: { id: userId },
      data: { deletedAt: null },
    });

    // ✅ ADD THIS: Log activity
    if (user) {
      await logActivity({
        userId: session.operatorId,
        category: 'TRASH',
        type: 'RESTORE',
        description: ActivityDescriptions.USER_RESTORED(user.username),
        entityType: 'User',
        entityId: userId,
        metadata: { username: user.username },
      });
    }

    return { success: 'User berhasil dipulihkan.' };
  } catch (error) {
    // ... error handling ...
  }
}
```

### Permanent Delete User
```typescript
export async function deleteUserPermanently(userId: string) {
  const session = await getSession();
  // ... validation code ...

  try {
    const user = await prisma.pengguna.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    await prisma.pengguna.delete({
      where: { id: userId },
    });

    // ✅ ADD THIS: Log activity
    if (user) {
      await logActivity({
        userId: session.operatorId,
        category: 'TRASH',
        type: 'PERMANENT_DELETE',
        description: ActivityDescriptions.USER_PERMANENT_DELETE(user.username),
        entityType: 'User',
        entityId: userId,
        metadata: { username: user.username },
      });
    }

    return { success: 'User berhasil dihapus permanen.' };
  } catch (error) {
    // ... error handling ...
  }
}
```

---

## 🔐 PROFILE Operations

### Update Profile
```typescript
export async function updateProfile(formData: FormData) {
  const session = await getSession();
  // ... validation code ...

  try {
    const updatedUser = await prisma.pengguna.update({
      where: { id: session.operatorId },
      data: { /* ... */ },
    });

    // ✅ ADD THIS: Log activity
    await logActivity({
      userId: session.operatorId,
      category: 'PROFILE',
      type: 'PROFILE_UPDATE',
      description: ActivityDescriptions.PROFILE_UPDATED(updatedUser.username),
      metadata: {
        fields_updated: ['nama', 'nrp_nip'], // sesuaikan
      },
    });

    return { success: 'Profil berhasil diupdate.' };
  } catch (error) {
    // ... error handling ...
  }
}
```

### Change Password
```typescript
export async function changePassword(oldPassword: string, newPassword: string) {
  const session = await getSession();
  // ... validation code ...

  try {
    // ... password validation & update logic ...

    // ✅ ADD THIS: Log activity
    await logActivity({
      userId: session.operatorId,
      category: 'PROFILE',
      type: 'PASSWORD_CHANGE',
      description: ActivityDescriptions.PASSWORD_CHANGED(session.username),
      status: 'SUCCESS',
    });

    return { success: 'Password berhasil diubah.' };
  } catch (error) {
    // ✅ ADD THIS: Log failed attempt
    await logActivity({
      userId: session.operatorId,
      category: 'PROFILE',
      type: 'PASSWORD_CHANGE',
      description: `Gagal mengganti password: ${error.message}`,
      status: 'FAILED',
    });

    return { error: 'Gagal mengubah password.' };
  }
}
```

### Update Profile Picture
```typescript
export async function updateProfilePicture(file: File) {
  const session = await getSession();
  // ... validation code ...

  try {
    // ... upload logic ...

    const updatedUser = await prisma.pengguna.update({
      where: { id: session.operatorId },
      data: { profilePictureUrl: uploadedUrl },
    });

    // ✅ ADD THIS: Log activity
    await logActivity({
      userId: session.operatorId,
      category: 'PROFILE',
      type: 'PROFILE_UPDATE',
      description: ActivityDescriptions.PROFILE_PICTURE_UPDATED(updatedUser.username),
      metadata: {
        old_picture: oldPictureUrl,
        new_picture: uploadedUrl,
      },
    });

    return { success: 'Foto profil berhasil diupdate.' };
  } catch (error) {
    // ... error handling ...
  }
}
```

---

## 🗑️ SYSTEM Operations

### Auto Purge Expired Trash
```typescript
export async function purgeExpiredTrash() {
  try {
    const expirationDate = new Date(Date.now() - TRASH_RETENTION_MS);
    
    const deletedSurats = await prisma.surat.deleteMany({
      where: {
        deletedAt: { lte: expirationDate },
      },
    });

    // ✅ ADD THIS: Log system activity
    if (deletedSurats.count > 0) {
      // Use system/admin user ID for system operations
      const systemUserId = 'system-user-id'; // or get first super admin
      
      await logActivity({
        userId: systemUserId,
        category: 'SYSTEM',
        type: 'PERMANENT_DELETE',
        description: ActivityDescriptions.SYSTEM_PURGE_TRASH(deletedSurats.count),
        metadata: {
          count: deletedSurats.count,
          retention_days: TRASH_RETENTION_DAYS,
        },
      });
    }

    return { success: `${deletedSurats.count} item kadaluarsa dihapus.` };
  } catch (error) {
    // ... error handling ...
  }
}
```

---

## 📥 VIEW & DOWNLOAD Operations (Optional)

### View Surat Detail
```typescript
// Di component atau page yang menampilkan detail surat
useEffect(() => {
  if (suratId) {
    // Log view activity
    logActivity({
      userId: session.operatorId,
      category: 'SURAT',
      type: 'VIEW',
      description: ActivityDescriptions.SURAT_VIEWED(surat.nomor_surat),
      entityType: 'Surat',
      entityId: suratId,
    });
  }
}, [suratId]);
```

### Download Lampiran
```typescript
export async function downloadLampiran(lampiranId: string) {
  const session = await getSession();

  try {
    const lampiran = await prisma.lampiran.findUnique({
      where: { id: lampiranId },
      include: {
        surat: {
          select: { nomor_surat: true },
        },
      },
    });

    // ... download logic ...

    // ✅ ADD THIS: Log download activity
    await logActivity({
      userId: session.operatorId,
      category: 'SURAT',
      type: 'DOWNLOAD',
      description: ActivityDescriptions.SURAT_DOWNLOADED(lampiran.surat.nomor_surat),
      entityType: 'Lampiran',
      entityId: lampiranId,
      metadata: {
        filename: lampiran.nama_file,
        nomor_surat: lampiran.surat.nomor_surat,
      },
    });

    return { success: 'File berhasil didownload.' };
  } catch (error) {
    // ... error handling ...
  }
}
```

---

## 🎯 Best Practices

### 1. Always Log After Success
```typescript
// ✅ GOOD
await prisma.surat.create({ data });
await logActivity({ /* ... */ }); // After success

// ❌ BAD
await logActivity({ /* ... */ }); // Before operation
await prisma.surat.create({ data }); // Might fail
```

### 2. Use Try-Catch for Critical Logs
```typescript
try {
  await prisma.surat.delete({ where: { id } });
  
  // Critical: log successful deletion
  await logActivity({
    userId: session.operatorId,
    category: 'SURAT',
    type: 'PERMANENT_DELETE',
    description: 'Deleted important data',
  });
} catch (error) {
  // Log failed attempt
  await logActivity({
    userId: session.operatorId,
    category: 'SURAT',
    type: 'PERMANENT_DELETE',
    description: 'Failed to delete',
    status: 'FAILED',
  });
  
  throw error;
}
```

### 3. Include Useful Metadata
```typescript
// ✅ GOOD - Rich metadata
await logActivity({
  userId: session.operatorId,
  category: 'SURAT',
  type: 'UPDATE',
  description: 'Updated surat',
  metadata: {
    nomor_surat: '123/ABC',
    fields_changed: ['perihal', 'tujuan'],
    old_perihal: 'Old value',
    new_perihal: 'New value',
  },
});

// ❌ BAD - No metadata
await logActivity({
  userId: session.operatorId,
  category: 'SURAT',
  type: 'UPDATE',
  description: 'Updated surat',
});
```

### 4. Don't Log Sensitive Data
```typescript
// ❌ NEVER LOG THESE
metadata: {
  password: '123456', // ❌
  token: 'abc123',    // ❌
  api_key: 'xyz',     // ❌
}

// ✅ LOG THESE INSTEAD
metadata: {
  password_changed: true, // ✅
  token_type: 'Bearer',   // ✅
  api_usage: 'read',      // ✅
}
```

---

## 📝 Quick Checklist

Sebelum commit, pastikan:

- [ ] Import `logActivity` dan `ActivityDescriptions`
- [ ] Log dipanggil SETELAH operasi berhasil
- [ ] Kategori dan tipe sudah benar
- [ ] Deskripsi jelas dan informatif
- [ ] EntityType dan entityId diisi (jika ada)
- [ ] Metadata berisi info berguna (tapi bukan data sensitif)
- [ ] Status di-set dengan benar (SUCCESS/FAILED/WARNING)
- [ ] Error handling sudah benar
- [ ] Test manual untuk memastikan log tercatat

---

**Happy Logging!** 🎉

Semua template di atas siap untuk di-copy-paste ke fungsi Anda.
