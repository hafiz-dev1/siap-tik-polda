// file: app/(app)/admin/actions.ts
'use server';

import { Prisma } from '@prisma/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { SURAT_TRASH_RETENTION_DAYS } from '@/lib/trashRetention';
import { logActivity, ActivityDescriptions } from '@/lib/activityLogger';

const SURAT_TRASH_RETENTION_MS = SURAT_TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

type LampiranRecord = {
  path_file: string | null;
};

// ✅ Base64 Solution: File tidak disimpan di filesystem, jadi tidak perlu dihapus
async function removeLampiranFiles(lampiranList: LampiranRecord[]) {
  // No-op: Files are stored as Base64 in database, not in filesystem
  // This function kept for backward compatibility but does nothing
  return Promise.resolve();
}

/**
 * Menangani proses logout pengguna (Admin dan User).
 */
export async function logout() {
  const session = await getSession();
  
  // Log logout activity before deleting the session
  if (session?.operatorId && session?.username) {
    await logActivity({
      userId: session.operatorId,
      category: 'AUTH',
      type: 'LOGOUT',
      description: ActivityDescriptions.LOGOUT(session.username),
      status: 'SUCCESS',
    });
  }
  
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}

/**
 * Membuat data surat baru. Hanya bisa dilakukan oleh ADMIN.
 */
export async function createSurat(formData: FormData) {
  // --- ROLE GUARD ---
  const session = await getSession();
  const role = session?.role as unknown as string | undefined;
  if (!session?.operatorId || !role || !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return { error: 'Gagal: Anda tidak memiliki hak akses untuk aksi ini.' };
  }
  // --- AKHIR ROLE GUARD ---

  try {
    const nomor_agenda = (formData.get('nomor_agenda') as string) || null;
    const tanggal_diterima_dibuat_raw = formData.get('tanggal_diterima_dibuat') as string;
    const tanggal_diterima_dibuat = tanggal_diterima_dibuat_raw ? new Date(tanggal_diterima_dibuat_raw) : null;
    const scan_surat = formData.get('scan_surat') as File;
    const nomor_surat = formData.get('nomor_surat') as string;
    const tanggal_surat = new Date(formData.get('tanggal_surat') as string);
    const perihal = formData.get('perihal') as string;
    const asal_surat = formData.get('asal_surat') as string;
    const tujuan_surat = formData.get('tujuan_surat') as string;
    const arah_surat = formData.get('arah_surat') as any;
    const tipe_dokumen = formData.get('tipe_dokumen') as any;
    const tujuan_disposisi = formData.getAll('tujuan_disposisi') as string[];
    const isi_disposisi = formData.get('isi_disposisi') as string;
    
    if (!scan_surat || scan_surat.size === 0) {
      return { error: 'Gagal: Scan surat wajib diupload.' };
    }

    // ✅ Validasi ukuran file (max 3MB untuk serverless)
    if (scan_surat.size > 3 * 1024 * 1024) {
      return { error: 'Ukuran file maksimal 3MB. Silakan kompres file terlebih dahulu.' };
    }

    // ✅ Base64 encoding untuk serverless compatibility (Vercel)
    const buffer = Buffer.from(await scan_surat.arrayBuffer());
    const base64 = buffer.toString('base64');
    const mimeType = scan_surat.type || 'application/pdf';
    const publicPath = `data:${mimeType};base64,${base64}`;

    const newSurat = await prisma.surat.create({
      data: {
        nomor_agenda,
        tanggal_diterima_dibuat,
        nomor_surat,
        tanggal_surat,
        perihal,
        asal_surat,
        tujuan_surat,
        arah_surat,
        tipe_dokumen,
        tujuan_disposisi,
        isi_disposisi,
        id_operator: session.operatorId, // ID Operator diambil dari sesi
        lampiran: {
          create: {
            nama_file: scan_surat.name,
            path_file: publicPath,
            tipe_file: scan_surat.type,
            ukuran_file: scan_surat.size,
          }
        }
      },
    });

    // Log activity
    await logActivity({
      userId: session.operatorId,
      category: 'SURAT',
      type: 'CREATE',
      description: ActivityDescriptions.SURAT_CREATED(nomor_surat, perihal),
      entityType: 'Surat',
      entityId: newSurat.id,
      metadata: {
        nomor_surat,
        perihal,
        arah_surat,
        tipe_dokumen,
      },
    });

  } catch (error) {
    console.error('Gagal membuat surat:', error);
    // Penanganan error spesifik untuk data duplikat (Unique Constraint)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = error.meta?.target as string[];
      if (target?.includes('nomor_agenda')) {
         return { error: 'Gagal: Nomor Agenda ini sudah digunakan.' };
      }
      if (target?.includes('nomor_surat')) {
         return { error: 'Gagal: Kombinasi Nomor Surat dan Tanggal Surat ini sudah digunakan. Silakan gunakan nomor atau tanggal yang berbeda.' };
      }
      return { error: 'Gagal: Data duplikat terdeteksi.'};
    }
    
    return { error: 'Gagal membuat surat karena kesalahan tak terduga.' };
  }

  revalidatePath('/arsip'); // Merevalidasi halaman arsip
  revalidatePath('/dashboard'); // Merevalidasi dashboard (untuk statistik)
  return { success: 'Surat berhasil ditambahkan.' };
}

/**
 * Melakukan soft delete pada surat. Hanya bisa dilakukan oleh ADMIN.
 */
export async function deleteSurat(suratId: string) {
  // --- ROLE GUARD ---
  const session = await getSession();
  const role = session?.role as unknown as string | undefined;
  if (!session?.operatorId || !role || !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return { error: 'Gagal: Anda tidak memiliki hak akses untuk aksi ini.' };
  }
  // --- AKHIR ROLE GUARD ---

  try {
    if (!suratId) {
      return { error: 'Gagal: ID Surat tidak valid.' };
    }
    
    const surat = await prisma.surat.findUnique({
      where: { id: suratId },
      select: { nomor_surat: true, perihal: true },
    });
    
    await prisma.surat.update({
      where: {
        id: suratId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    // Log activity
    if (surat) {
      await logActivity({
        userId: session.operatorId,
        category: 'SURAT',
        type: 'DELETE',
        description: ActivityDescriptions.SURAT_DELETED(surat.nomor_surat),
        entityType: 'Surat',
        entityId: suratId,
        metadata: {
          nomor_surat: surat.nomor_surat,
          perihal: surat.perihal,
        },
      });
    }
  } catch (error) {
    console.error('Gagal menghapus surat:', error);
    return { error: 'Gagal menghapus surat.' };
  }

  revalidatePath('/arsip');
  revalidatePath('/dashboard');
  revalidatePath('/admin/trash'); // Revalidasi halaman tempat sampah
  return { success: 'Surat berhasil dihapus.' };
}

/**
 * Melakukan soft delete pada multiple surat sekaligus. Hanya bisa dilakukan oleh ADMIN.
 */
export async function deleteBulkSurat(suratIds: string[]) {
  // --- ROLE GUARD ---
  const session = await getSession();
  const role = session?.role as unknown as string | undefined;
  if (!session?.operatorId || !role || !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return { error: 'Gagal: Anda tidak memiliki hak akses untuk aksi ini.' };
  }
  // --- AKHIR ROLE GUARD ---

  try {
    if (!suratIds || suratIds.length === 0) {
      return { error: 'Gagal: Tidak ada surat yang dipilih.' };
    }

    // Bulk update semua surat yang dipilih
    await prisma.surat.updateMany({
      where: {
        id: {
          in: suratIds,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });

    // Log activity
    await logActivity({
      userId: session.operatorId,
      category: 'SURAT',
      type: 'BULK_DELETE',
      description: `Menghapus ${suratIds.length} surat sekaligus`,
      metadata: {
        count: suratIds.length,
        suratIds,
      },
    });
  } catch (error) {
    console.error('Gagal menghapus surat secara bulk:', error);
    return { error: 'Gagal menghapus surat.' };
  }

  revalidatePath('/arsip');
  revalidatePath('/dashboard');
  revalidatePath('/admin/trash');
  return { success: `${suratIds.length} surat berhasil dihapus.` };
}

/**
 * Memperbarui data surat yang ada. Hanya bisa dilakukan oleh ADMIN.
 */
export async function updateSurat(suratId: string, formData: FormData) {
  // --- ROLE GUARD ---
  const session = await getSession();
  const role = session?.role as unknown as string | undefined;
  if (!session?.operatorId || !role || !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return { error: 'Gagal: Anda tidak memiliki hak akses untuk aksi ini.' };
  }
  // --- AKHIR ROLE GUARD ---

  try {
    if (!suratId) {
      return { error: 'Gagal: ID Surat tidak valid.' };
    }
    
    // Ekstrak data dari form
    const nomor_agenda = (formData.get('nomor_agenda') as string) || null;
    const tanggal_diterima_dibuat_raw = formData.get('tanggal_diterima_dibuat') as string;
    const tanggal_diterima_dibuat = tanggal_diterima_dibuat_raw ? new Date(tanggal_diterima_dibuat_raw) : null;
    const nomor_surat = formData.get('nomor_surat') as string;
    const tanggal_surat = new Date(formData.get('tanggal_surat') as string);
    const perihal = formData.get('perihal') as string;
    const asal_surat = formData.get('asal_surat') as string;
    const tujuan_surat = formData.get('tujuan_surat') as string;
    const arah_surat = formData.get('arah_surat') as any;
    const tipe_dokumen = formData.get('tipe_dokumen') as any;
    const tujuan_disposisi = formData.getAll('tujuan_disposisi') as string[];
    const isi_disposisi = formData.get('isi_disposisi') as string;
    
    const updatedSurat = await prisma.surat.update({
      where: { id: suratId },
      data: {
        nomor_agenda,
        tanggal_diterima_dibuat,
        nomor_surat,
        tanggal_surat,
        perihal,
        asal_surat,
        tujuan_surat,
        arah_surat,
        tipe_dokumen,
        tujuan_disposisi,
        isi_disposisi,
      },
    });

    // Log activity
    await logActivity({
      userId: session.operatorId,
      category: 'SURAT',
      type: 'UPDATE',
      description: ActivityDescriptions.SURAT_UPDATED(nomor_surat, perihal),
      entityType: 'Surat',
      entityId: suratId,
      metadata: {
        nomor_surat,
        perihal,
        arah_surat,
        tipe_dokumen,
      },
    });

  } catch (error) {
    console.error('Gagal memperbarui surat:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = error.meta?.target as string[];
      if (target?.includes('nomor_agenda')) {
        return { error: 'Gagal: Nomor Agenda ini sudah digunakan oleh surat lain.' };
      }
      if (target?.includes('nomor_surat')) {
        return { error: 'Gagal: Kombinasi Nomor Surat dan Tanggal Surat ini sudah digunakan oleh surat lain. Silakan gunakan nomor atau tanggal yang berbeda.' };
      }
      return { error: 'Gagal: Data duplikat terdeteksi.' };
    }
    return { error: 'Gagal memperbarui surat.' };
  }

  revalidatePath('/arsip');
  revalidatePath('/dashboard');
  return { success: 'Surat berhasil diperbarui.' };
}

/**
 * Mengembalikan surat dari soft-delete (restore). Hanya Admin.
 */
export async function restoreSurat(suratId: string) {
  const session = await getSession();
  const role = session?.role as unknown as string | undefined;
  if (!session?.operatorId || !role || !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return { error: 'Gagal: Anda tidak memiliki hak akses.' };
  }

  try {
    const surat = await prisma.surat.findUnique({
      where: { id: suratId },
      select: { nomor_surat: true, perihal: true },
    });

    await prisma.surat.update({
      where: { id: suratId },
      data: { deletedAt: null }, // Set deletedAt kembali ke NULL
    });

    // Log activity
    if (surat) {
      await logActivity({
        userId: session.operatorId,
        category: 'TRASH',
        type: 'RESTORE',
        description: `Memulihkan surat "${surat.nomor_surat}" dari tempat sampah`,
        entityType: 'Surat',
        entityId: suratId,
        metadata: {
          nomor_surat: surat.nomor_surat,
          perihal: surat.perihal,
        },
      });
    }
  } catch (error) {
    return { error: 'Gagal memulihkan surat.' };
  }

  revalidatePath('/arsip');
  revalidatePath('/admin/trash'); // Revalidasi halaman arsip dan tempat sampah
  return { success: 'Surat berhasil dipulihkan.' };
}

/**
 * Memulihkan multiple surat sekaligus dari soft-delete (restore). Hanya Admin.
 */
export async function restoreBulkSurat(suratIds: string[]) {
  const session = await getSession();
  const role = session?.role as unknown as string | undefined;
  if (!session?.operatorId || !role || !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return { error: 'Gagal: Anda tidak memiliki hak akses.' };
  }

  try {
    if (!suratIds || suratIds.length === 0) {
      return { error: 'Gagal: Tidak ada surat yang dipilih.' };
    }

    await prisma.surat.updateMany({
      where: { 
        id: { in: suratIds },
      },
      data: { deletedAt: null }, // Set deletedAt kembali ke NULL
    });

    // Log activity
    await logActivity({
      userId: session.operatorId,
      category: 'TRASH',
      type: 'BULK_RESTORE',
      description: `Memulihkan ${suratIds.length} surat dari tempat sampah`,
      metadata: {
        count: suratIds.length,
        suratIds,
      },
    });
  } catch (error) {
    console.error('Gagal memulihkan surat secara bulk:', error);
    return { error: 'Gagal memulihkan surat.' };
  }

  revalidatePath('/arsip');
  revalidatePath('/admin/trash');
  return { success: `${suratIds.length} surat berhasil dipulihkan.` };
}

/**
 * Menghapus surat secara permanen dari database. Hanya Admin.
 */
export async function deleteSuratPermanently(suratId: string) {
  const session = await getSession();
  const role = session?.role as unknown as string | undefined;
  if (!session?.operatorId || !role || !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return { error: 'Gagal: Anda tidak memiliki hak akses.' };
  }

  try {
    const surat = await prisma.surat.findUnique({
      where: { id: suratId },
      select: {
        id: true,
        nomor_surat: true,
        perihal: true,
        lampiran: {
          select: {
            path_file: true,
          },
        },
      },
    });

    if (!surat) {
      return { error: 'Surat tidak ditemukan.' };
    }

    await removeLampiranFiles(surat.lampiran);

    await prisma.surat.delete({
      where: { id: suratId },
    });

    // Log activity
    await logActivity({
      userId: session.operatorId,
      category: 'TRASH',
      type: 'PERMANENT_DELETE',
      description: `Menghapus permanen surat "${surat.nomor_surat}"`,
      metadata: {
        nomor_surat: surat.nomor_surat,
        perihal: surat.perihal,
      },
    });
  } catch (deleteError) {
    console.error('Gagal menghapus surat secara permanen:', deleteError);
    return { error: 'Gagal menghapus surat secara permanen.' };
  }

  revalidatePath('/admin/trash');
  revalidatePath('/dashboard'); // Update statistik
  return { success: 'Surat berhasil dihapus permanen.' };
}

/**
 * Menghapus multiple surat secara permanen dari database. Hanya Admin.
 */
export async function deleteBulkSuratPermanently(suratIds: string[]) {
  const session = await getSession();
  const role = session?.role as unknown as string | undefined;
  if (!session?.operatorId || !role || !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return { error: 'Gagal: Anda tidak memiliki hak akses.' };
  }

  try {
    if (!suratIds || suratIds.length === 0) {
      return { error: 'Gagal: Tidak ada surat yang dipilih.' };
    }

    const suratList = await prisma.surat.findMany({
      where: { id: { in: suratIds } },
      select: {
        id: true,
        lampiran: {
          select: {
            path_file: true,
          },
        },
      },
    });

    if (suratList.length === 0) {
      return { error: 'Surat tidak ditemukan.' };
    }

    // Hapus semua lampiran files
    for (const surat of suratList) {
      await removeLampiranFiles(surat.lampiran);
    }

    // Delete semua surat
    await prisma.surat.deleteMany({
      where: { id: { in: suratIds } },
    });

    // Log activity
    await logActivity({
      userId: session.operatorId,
      category: 'TRASH',
      type: 'BULK_PERMANENT_DELETE',
      description: `Menghapus permanen ${suratIds.length} surat sekaligus`,
      metadata: {
        count: suratIds.length,
        suratIds,
      },
    });
  } catch (deleteError) {
    console.error('Gagal menghapus surat secara permanen (bulk):', deleteError);
    return { error: 'Gagal menghapus surat secara permanen.' };
  }

  revalidatePath('/admin/trash');
  revalidatePath('/dashboard');
  return { success: `${suratIds.length} surat berhasil dihapus secara permanen.` };
}

/**
 * Memulihkan akun pengguna yang di-soft-delete. Hanya Admin.
 */
export async function restoreUser(userId: string) {
  const session = await getSession();
  const role = session?.role as unknown as string | undefined;
  if (!session?.operatorId || role !== 'SUPER_ADMIN') {
    return { error: 'Gagal: Anda tidak memiliki hak akses.' };
  }

  try {
    const user = await prisma.pengguna.findUnique({
      where: { id: userId },
      select: { username: true, nama: true },
    });

    await prisma.pengguna.update({
      where: { id: userId },
      data: { deletedAt: null },
    });

    // Log activity
    if (user) {
      await logActivity({
        userId: session.operatorId,
        category: 'USER',
        type: 'RESTORE',
        description: `Memulihkan akun pengguna "${user.username}" (${user.nama})`,
        entityType: 'Pengguna',
        entityId: userId,
        metadata: {
          username: user.username,
          nama: user.nama,
        },
      });
    }
  } catch (error) {
    console.error('Gagal memulihkan pengguna:', error);
    return { error: 'Gagal memulihkan akun pengguna.' };
  }

  revalidatePath('/admin/users');
  revalidatePath('/admin/trash');
  return { success: 'Akun pengguna berhasil dipulihkan.' };
}

/**
 * Menghapus akun pengguna secara permanen. Hanya Admin dan tidak bisa menghapus diri sendiri.
 */
export async function deleteUserPermanently(userId: string) {
  const session = await getSession();
  const role = session?.role as unknown as string | undefined;
  if (!session?.operatorId || role !== 'SUPER_ADMIN') {
    return { error: 'Gagal: Anda tidak memiliki hak akses.' };
  }

  if (session.operatorId === userId) {
    return { error: 'Gagal: Anda tidak dapat menghapus akun Anda sendiri.' };
  }

  try {
    // 1. Ambil pengguna dan password hash-nya dari DB
    const user = await prisma.pengguna.findUnique({
      where: { id: userId },
      select: { profilePictureUrl: true, username: true, nama: true },
    });

    if (!user) {
      return { error: 'Akun pengguna tidak ditemukan.' };
    }

    // ✅ Base64 Solution: Profile picture stored in database, no file to delete

    await prisma.pengguna.delete({
      where: { id: userId },
    });

    // Log activity
    await logActivity({
      userId: session.operatorId,
      category: 'USER',
      type: 'PERMANENT_DELETE',
      description: `Menghapus permanen akun "${user.username}" (${user.nama})`,
      metadata: {
        username: user.username,
        nama: user.nama,
      },
    });
  } catch (error) {
    console.error('Gagal menghapus pengguna secara permanen:', error);
    return { error: 'Gagal menghapus akun pengguna secara permanen.' };
  }

  revalidatePath('/admin/users');
  revalidatePath('/admin/trash');
  return { success: 'Akun pengguna berhasil dihapus permanen.' };
}

/**
 * Memulihkan multiple akun pengguna yang di-soft-delete. Hanya SUPER_ADMIN.
 */
export async function restoreBulkUsers(userIds: string[]) {
  const session = await getSession();
  const role = session?.role as unknown as string | undefined;
  if (!session?.operatorId || role !== 'SUPER_ADMIN') {
    return { error: 'Gagal: Anda tidak memiliki hak akses.' };
  }

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return { error: 'Daftar akun pengguna tidak valid.' };
  }

  try {
    await prisma.pengguna.updateMany({
      where: { id: { in: userIds } },
      data: { deletedAt: null },
    });

    // Log activity
    await logActivity({
      userId: session.operatorId,
      category: 'USER',
      type: 'BULK_RESTORE',
      description: `Memulihkan ${userIds.length} akun pengguna dari tempat sampah`,
      metadata: {
        count: userIds.length,
        userIds,
      },
    });
  } catch (error) {
    console.error('Gagal memulihkan pengguna secara bulk:', error);
    return { error: 'Gagal memulihkan akun pengguna.' };
  }

  revalidatePath('/admin/users');
  revalidatePath('/admin/trash');
  return { success: `${userIds.length} akun pengguna berhasil dipulihkan.` };
}

/**
 * Menghapus multiple akun pengguna secara permanen. Hanya SUPER_ADMIN.
 */
export async function deleteBulkUsersPermanently(userIds: string[]) {
  const session = await getSession();
  const role = session?.role as unknown as string | undefined;
  if (!session?.operatorId || role !== 'SUPER_ADMIN') {
    return { error: 'Gagal: Anda tidak memiliki hak akses.' };
  }

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return { error: 'Daftar akun pengguna tidak valid.' };
  }

  // Cek apakah user mencoba menghapus diri sendiri
  if (userIds.includes(session.operatorId)) {
    return { error: 'Gagal: Anda tidak dapat menghapus akun Anda sendiri.' };
  }

  try {
    const users = await prisma.pengguna.findMany({
      where: { id: { in: userIds } },
      select: { id: true, profilePictureUrl: true },
    });

    if (users.length === 0) {
      return { error: 'Tidak ada akun pengguna yang ditemukan.' };
    }

    // ✅ Base64 Solution: Profile pictures stored in database, no files to delete

    await prisma.pengguna.deleteMany({
      where: { id: { in: userIds } },
    });

    // Log activity
    await logActivity({
      userId: session.operatorId,
      category: 'USER',
      type: 'BULK_PERMANENT_DELETE',
      description: `Menghapus permanen ${userIds.length} akun pengguna sekaligus`,
      metadata: {
        count: userIds.length,
        userIds,
      },
    });
  } catch (error) {
    console.error('Gagal menghapus pengguna secara permanen (bulk):', error);
    return { error: 'Gagal menghapus akun pengguna secara permanen.' };
  }

  revalidatePath('/admin/users');
  revalidatePath('/admin/trash');
  return { success: `${userIds.length} akun pengguna berhasil dihapus permanen.` };
}

/**
 * Menghapus permanen surat yang sudah lebih dari 30 hari berada di tempat sampah.
 */
export async function purgeExpiredSuratTrash() {
  const cutoffDate = new Date(Date.now() - SURAT_TRASH_RETENTION_MS);

  const expiredSuratList = await prisma.surat.findMany({
    where: {
      deletedAt: {
        not: null,
        lt: cutoffDate,
      },
    },
    select: {
      id: true,
      lampiran: {
        select: {
          path_file: true,
        },
      },
    },
  });

  if (expiredSuratList.length === 0) {
    return { purged: 0 };
  }

  await Promise.all(
    expiredSuratList.map(async (surat) => {
      await removeLampiranFiles(surat.lampiran);
      await prisma.surat.delete({
        where: { id: surat.id },
      });
    })
  );

  revalidatePath('/admin/trash');
  revalidatePath('/dashboard');
  revalidatePath('/arsip');

  return { purged: expiredSuratList.length };
}