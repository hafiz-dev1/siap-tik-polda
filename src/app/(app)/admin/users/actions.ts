// file: app/(app)/admin/users/actions.ts
'use server';

import { PrismaClient, Role, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { getSession } from '@/lib/session';

const prisma = new PrismaClient();

/**
 * Mengambil semua pengguna yang aktif (belum di-soft-delete).
 * Hanya bisa diakses oleh ADMIN.
 */
export async function getUsers() {
  // --- ROLE GUARD ---
  const session = await getSession();
  if (!session?.operatorId || session.role !== 'ADMIN') {
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
 * Membuat pengguna baru. Hanya bisa dilakukan oleh ADMIN.
 */
export async function createUser(formData: FormData) {
  // --- ROLE GUARD ---
  const session = await getSession();
  if (!session?.operatorId || session.role !== 'ADMIN') {
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
 * Memperbarui data pengguna. Hanya Admin.
 * (Tidak bisa mengubah username atau foto profil, sesuai aturan kita sebelumnya)
 */
export async function updateUser(userId: string, formData: FormData) {
  // --- ROLE GUARD ---
  const session = await getSession();
  if (!session?.operatorId || session.role !== 'ADMIN') {
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

    const dataToUpdate: any = {
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
 * Melakukan soft delete pada pengguna. Hanya Admin dan tidak bisa hapus diri sendiri.
 */
export async function deleteUser(userId: string) {
  // 1. Role Guard
  const session = await getSession();
  if (!session?.operatorId || session.role !== 'ADMIN') {
    return { error: 'Anda tidak memiliki hak akses.' };
  }

  // 2. Self-Deletion Guard
  if (session.operatorId === userId) {
    return { error: 'Gagal: Anda tidak dapat menghapus akun Anda sendiri.' };
  }

  try {
    await prisma.pengguna.update({
      where: { id: userId },
      data: { deletedAt: new Date() }, // Lakukan soft delete
    });
  } catch (error) {
    return { error: 'Gagal menghapus pengguna.' };
  }

  revalidatePath('/admin/users');
  return { success: 'Pengguna berhasil dihapus.' };
}