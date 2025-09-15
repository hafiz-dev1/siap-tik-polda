// file: app/admin/users/actions.ts
'use server';

import { PrismaClient, Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { getSession } from '@/lib/session'; // Import our session helper

const prisma = new PrismaClient();

/**
 * Fetches all users. Only an ADMIN can perform this action.
 * @returns {Promise<Pengguna[]>} A list of all users.
 */
export async function getUsers() {
  // --- ROLE GUARD ---
  const session = await getSession();
  if (!session?.operatorId || session.role !== 'ADMIN') {
    return []; // Return an empty array if not authorized
  }
  // --- END ROLE GUARD ---
  
  try {
    const users = await prisma.pengguna.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return users;
  } catch (error) {
    console.error('Gagal mengambil data pengguna:', error);
    return [];
  }
}

/**
 * Creates a new user. Only an ADMIN can perform this action.
 * @param {FormData} formData - Data from the "Tambah Pengguna" form.
 * @returns {Promise<{message: string}>} A success or failure message.
 */
export async function createUser(formData: FormData) {
  // --- ROLE GUARD ---
  const session = await getSession();
  if (!session?.operatorId || session.role !== 'ADMIN') {
    return { message: 'Gagal: Anda tidak memiliki hak akses.' };
  }
  // --- END ROLE GUARD ---

  try {
    const nama = formData.get('nama') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as Role;
    const profilePicture = formData.get('profilePicture') as File | null;

    if (!nama || !username || !password || !role) {
      return { message: 'Gagal: Semua field wajib diisi.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let profilePictureUrl: string | undefined = undefined;

    // Handle profile picture upload
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
    console.error('Gagal membuat pengguna:', error);
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return { message: 'Gagal: Username sudah digunakan.' };
    }
    return { message: 'Gagal membuat pengguna.' };
  }

  revalidatePath('/admin/users');
  return { message: 'Pengguna baru berhasil ditambahkan.' };
}

/**
 * Updates an existing user's information. Only an ADMIN can perform this action.
 * @param {string} userId - The ID of the user to update.
 * @param {FormData} formData - The new data from the "Ubah Pengguna" form.
 * @returns {Promise<{message: string}>} A success or failure message.
 */
export async function updateUser(userId: string, formData: FormData) {
  // --- ROLE GUARD ---
  const session = await getSession();
  if (!session?.operatorId || session.role !== 'ADMIN') {
    return { message: 'Gagal: Anda tidak memiliki hak akses.' };
  }
  // --- END ROLE GUARD ---

  try {
    if (!userId) {
      return { message: 'Gagal: ID Pengguna tidak valid.' };
    }
    
    const nama = formData.get('nama') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as Role;
    const profilePicture = formData.get('profilePicture') as File | null;

    const dataToUpdate: any = {
      nama,
      username,
      role,
    };

    // Only hash and update the password if a new one is provided
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    // Only update the profile picture if a new file is uploaded
    if (profilePicture && profilePicture.size > 0) {
      const buffer = Buffer.from(await profilePicture.arrayBuffer());
      const filename = `${Date.now()}-${profilePicture.name.replace(/\s/g, '_')}`;
      const uploadPath = path.join(process.cwd(), 'public/uploads/profiles', filename);
      
      await fs.mkdir(path.dirname(uploadPath), { recursive: true });
      await fs.writeFile(uploadPath, buffer);
      dataToUpdate.profilePictureUrl = `/uploads/profiles/${filename}`;
    }

    await prisma.pengguna.update({
      where: { id: userId },
      data: dataToUpdate,
    });

  } catch (error) {
    console.error('Gagal memperbarui pengguna:', error);
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return { message: 'Gagal: Username sudah digunakan.' };
    }
    return { message: 'Gagal memperbarui pengguna.' };
  }
  
  revalidatePath('/admin/users');
  return { message: 'Data pengguna berhasil diperbarui.' };
}