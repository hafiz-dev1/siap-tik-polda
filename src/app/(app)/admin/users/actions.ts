// file: app/(app)/admin/users/actions.ts
'use server';

import { Role, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

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

    // Logika upload foto profil (hanya saat membuat baru)
    if (profilePicture && profilePicture.size > 0) {
      const buffer = Buffer.from(await profilePicture.arrayBuffer());
      const filename = `${Date.now()}-${profilePicture.name.replace(/\s/g, '_')}`;
      const uploadPath = path.join(process.cwd(), 'public/uploads/profiles', filename);
      
      await fs.mkdir(path.dirname(uploadPath), { recursive: true });
      await fs.writeFile(uploadPath, buffer);
      profilePictureUrl = `/uploads/profiles/${filename}`;
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
      select: { role: true },
    });

    if (!targetUser) {
      return { error: 'Pengguna tidak ditemukan.' };
    }

    if (!session) {
      return { error: 'Sesi tidak valid.' };
    }

    if (targetUser.role === Role.SUPER_ADMIN && session.role !== Role.SUPER_ADMIN) {
      return { error: 'Anda tidak dapat mengubah akun Super Admin.' };
    }

    if (!nama) {
      return { error: 'Nama wajib diisi.' };
    }

    if (role === Role.SUPER_ADMIN && userId !== session.operatorId) {
      return { error: 'Hanya Super Admin aktif yang dapat mempertahankan peran Super Admin.' };
    }

    if (userId === session.operatorId && role !== Role.SUPER_ADMIN) {
      return { error: 'Super Admin tidak dapat menurunkan perannya sendiri.' };
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

  if (!session) {
    return { error: 'Sesi tidak valid.' };
  }

  // 2. Self-Deletion Guard
  if (session.operatorId === userId) {
    return { error: 'Gagal: Anda tidak dapat menghapus akun Anda sendiri.' };
  }

  try {
    const targetUser = await prisma.pengguna.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!targetUser) {
      return { error: 'Pengguna tidak ditemukan.' };
    }

    if (targetUser.role === Role.SUPER_ADMIN) {
      return { error: 'Super Admin tidak dapat dihapus.' };
    }

    await prisma.pengguna.update({
      where: { id: userId },
      data: { deletedAt: new Date() }, // Lakukan soft delete
    });
  } catch (error) {
    console.error('Gagal menghapus pengguna:', error);
    return { error: 'Gagal menghapus pengguna.' };
  }

  revalidatePath('/admin/users');
  return { success: 'Pengguna berhasil dihapus.' };
}