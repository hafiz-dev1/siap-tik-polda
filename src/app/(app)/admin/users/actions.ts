'use server';

import { Role, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { logActivity, ActivityDescriptions } from '@/lib/activityLogger';

const USER_MANAGEMENT_ROLES: Role[] = [Role.SUPER_ADMIN, Role.ADMIN];

type SessionResult = Awaited<ReturnType<typeof getSession>>;
type AppSession = SessionResult extends null ? never : SessionResult;

function hasUserManagementAccess(
  session: SessionResult
): session is AppSession {
  return (
    !!session &&
    typeof session.operatorId === 'string' &&
    USER_MANAGEMENT_ROLES.includes(session.role)
  );
}

/**
 * Mengambil semua pengguna yang aktif (belum di-soft-delete).
 * Hanya bisa diakses oleh peran manajer pengguna (Super Admin & Admin).
 */
export async function getUsers() {
  // --- ROLE GUARD ---
  const session = await getSession();
  if (!hasUserManagementAccess(session)) {
    return []; // Jika bukan admin, kembalikan array kosong (tidak berhak melihat)
  }
  // --- AKHIR ROLE GUARD ---
  
  try {
    const users = await prisma.pengguna.findMany({
      where: { deletedAt: null }, // Hanya ambil pengguna yang aktif
      orderBy: { createdAt: 'desc' },
    });
    return users;
  } catch (error) {
    console.error('Gagal mengambil data pengguna:', error);
    return [];
  }
}

/**
 * Membuat pengguna baru. Hanya bisa dilakukan oleh peran manajer pengguna (Super Admin & Admin).
 */
export async function createUser(formData: FormData) {
  // --- ROLE GUARD ---
  const session = await getSession();
  if (!hasUserManagementAccess(session)) {
    return { error: 'Gagal: Anda tidak memiliki hak akses.' };
  }
  // --- AKHIR ROLE GUARD ---

  try {
    const nama = formData.get('nama') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as Role;
    const profilePicture = formData.get('profilePicture') as File | null;

    if (!nama || !username || !password || !role) {
      return { error: 'Gagal: Semua field wajib diisi.' };
    }

    if (role === Role.SUPER_ADMIN) {
      return { error: 'Gagal: Hanya boleh ada satu Super Admin aktif.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let profilePictureUrl: string | undefined = undefined;

    // ✅ Base64 encoding untuk serverless compatibility (Vercel)
    if (profilePicture && profilePicture.size > 0) {
      // Validasi ukuran file (max 2MB)
      if (profilePicture.size > 2 * 1024 * 1024) {
        return { error: 'Ukuran foto maksimal 2MB' };
      }

      const buffer = Buffer.from(await profilePicture.arrayBuffer());
      const base64 = buffer.toString('base64');
      const mimeType = profilePicture.type || 'image/jpeg';
      profilePictureUrl = `data:${mimeType};base64,${base64}`;
    }

    await prisma.pengguna.create({
      data: {
        nama,
        username,
        password: hashedPassword,
        role,
        profilePictureUrl,
      },
    });

    // Log activity
    await logActivity({
      userId: session!.operatorId,
      category: 'USER',
      type: 'CREATE',
      description: ActivityDescriptions.USER_CREATED(username, nama),
      metadata: {
        username,
        nama,
        role,
      },
    });

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { error: 'Gagal: Username sudah digunakan.' };
    }
    console.error('Gagal membuat pengguna:', error);
    return { error: 'Gagal membuat pengguna.' };
  }

  revalidatePath('/admin/users');
  return { success: 'Pengguna baru berhasil ditambahkan.' };
}

/**
 * Memperbarui data pengguna. Hanya peran manajer pengguna (Super Admin & Admin).
 * (Tidak bisa mengubah username atau foto profil, sesuai aturan kita sebelumnya)
 */
export async function updateUser(userId: string, formData: FormData) {
  // --- ROLE GUARD ---
  const session = await getSession();
  if (!hasUserManagementAccess(session)) {
    return { error: 'Gagal: Anda tidak memiliki hak akses.' };
  }
  // --- AKHIR ROLE GUARD ---

  try {
    if (!userId) {
      return { error: 'Gagal: ID Pengguna tidak valid.' };
    }
    
    const nama = formData.get('nama') as string;
    const role = formData.get('role') as Role;
    const password = formData.get('password') as string;

    const targetUser = await prisma.pengguna.findUnique({
      where: { id: userId },
      select: { role: true, username: true },
    });

    if (!targetUser) {
      return { error: 'Pengguna tidak ditemukan.' };
    }

    if (!session) {
      return { error: 'Sesi tidak valid.' };
    }

    // Proteksi: Tidak bisa mengubah akun superadmin atau role SUPER_ADMIN
    if (targetUser.username === 'superadmin' || targetUser.role === Role.SUPER_ADMIN) {
      return { error: 'Gagal: Akun Super Admin dilindungi dan tidak dapat diubah.' };
    }

    if (!nama) {
      return { error: 'Nama wajib diisi.' };
    }

    if (role === Role.SUPER_ADMIN) {
      return { error: 'Gagal: Tidak dapat mengubah role menjadi Super Admin.' };
    }

    const dataToUpdate: Prisma.PenggunaUpdateInput = {
      nama,
      role,
    };

    // Admin bisa me-reset password pengguna jika diisi
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }
    
    await prisma.pengguna.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    // Log activity
    await logActivity({
      userId: session!.operatorId,
      category: 'USER',
      type: 'UPDATE',
      description: ActivityDescriptions.USER_UPDATED(nama, nama),
      entityType: 'Pengguna',
      entityId: userId,
      metadata: {
        nama,
        role,
        passwordChanged: !!password,
      },
    });

  } catch (error) {
    console.error('Gagal memperbarui pengguna:', error);
    return { error: 'Gagal memperbarui pengguna.' };
  }
  
  revalidatePath('/admin/users');
  return { success: 'Data pengguna berhasil diperbarui.' };
}

/**
 * Melakukan soft delete pada pengguna. Hanya peran manajer pengguna (Super Admin & Admin) dan tidak bisa hapus diri sendiri.
 */
export async function deleteUser(userId: string) {
  // 1. Role Guard
  const session = await getSession();
  if (!hasUserManagementAccess(session)) {
    return { error: 'Anda tidak memiliki hak akses.' };
  }

  // 2. Self-Deletion Guard
  if (session!.operatorId === userId) {
    return { error: 'Gagal: Anda tidak dapat menghapus akun Anda sendiri.' };
  }

  try {
    const targetUser = await prisma.pengguna.findUnique({
      where: { id: userId },
      select: { role: true, username: true, nama: true },
    });

    if (!targetUser) {
      return { error: 'Pengguna tidak ditemukan.' };
    }

    // 3. Proteksi: Tidak bisa menghapus akun superadmin atau role SUPER_ADMIN
    if (targetUser.username === 'superadmin' || targetUser.role === Role.SUPER_ADMIN) {
      return { error: 'Gagal: Akun Super Admin dilindungi dan tidak dapat dihapus.' };
    }

    await prisma.pengguna.update({
      where: { id: userId },
      data: { deletedAt: new Date() }, // Lakukan soft delete
    });

    // Log activity
    await logActivity({
      userId: session!.operatorId,
      category: 'USER',
      type: 'DELETE',
      description: ActivityDescriptions.USER_DELETED(targetUser.username, targetUser.nama),
      entityType: 'Pengguna',
      entityId: userId,
      metadata: {
        username: targetUser.username,
        nama: targetUser.nama,
        role: targetUser.role,
      },
    });
  } catch (error) {
    console.error('Gagal menghapus pengguna:', error);
    return { error: 'Gagal menghapus pengguna.' };
  }

  revalidatePath('/admin/users');
  return { success: 'Pengguna berhasil dihapus.' };
}