// file: app/admin/users/actions.ts
'use server';

import { PrismaClient, Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

/**
 * Fetches all users from the database.
 */
export async function getUsers() {
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
 * Creates a new user in the database.
 */
export async function createUser(formData: FormData) {
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
 * Updates an existing user's information.
 */
export async function updateUser(userId: string, formData: FormData) {
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

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

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