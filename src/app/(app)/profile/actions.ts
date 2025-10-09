// file: app/(app)/profile/actions.ts
'use server';

import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { logActivity, ActivityDescriptions } from '@/lib/activityLogger';

/**
 * Memperbarui informasi dasar pengguna (nama, username, nrp_nip, foto profil)
 */
export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: 'Tidak terautentikasi' };

  const nama = formData.get('nama') as string;
  const username = formData.get('username') as string;
  const nrp_nip = formData.get('nrp_nip') as string | null;
  const profilePicture = formData.get('profilePicture') as File | null;
  const deletePhoto = formData.get('deletePhoto') as string | null;

  const dataToUpdate: any = { nama, username, nrp_nip };

  try {
    // Handle photo deletion
    if (deletePhoto === 'true') {
      dataToUpdate.profilePictureUrl = null;
    }
    // ✅ Base64 encoding untuk serverless compatibility (Vercel)
    else if (profilePicture && profilePicture.size > 0) {
      // Validasi ukuran file (max 2MB untuk performa optimal)
      if (profilePicture.size > 2 * 1024 * 1024) {
        return { error: 'Ukuran foto maksimal 2MB' };
      }

      const buffer = Buffer.from(await profilePicture.arrayBuffer());
      const base64 = buffer.toString('base64');
      const mimeType = profilePicture.type || 'image/jpeg';
      
      // Format Data URI: data:image/jpeg;base64,/9j/4AAQSkZJRg...
      dataToUpdate.profilePictureUrl = `data:${mimeType};base64,${base64}`;
    }

    await prisma.pengguna.update({
      where: { id: session.operatorId },
      data: dataToUpdate,
    });

    // Log activity
    await logActivity({
      userId: session.operatorId,
      category: 'PROFILE',
      type: 'UPDATE',
      description: ActivityDescriptions.PROFILE_UPDATED(username),
      metadata: {
        nama,
        username,
        nrp_nip: nrp_nip || undefined,
        profilePictureUpdated: !!(profilePicture && profilePicture.size > 0),
        profilePictureDeleted: deletePhoto === 'true',
      },
    });

    revalidatePath('/(app)/layout', 'layout'); // Revalidasi layout untuk update nama di navbar
    
    if (deletePhoto === 'true') {
      return { success: 'Profil berhasil diperbarui. Foto profil telah dihapus.' };
    }
    
    return { success: 'Profil berhasil diperbarui.' };

  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return { error: 'Username tersebut sudah digunakan.' };
    }
    return { error: 'Gagal memperbarui profil.' };
  }
}


/**
 * Mengganti password pengguna setelah verifikasi password lama
 */
export async function changePassword(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: 'Tidak terautentikasi' };

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!currentPassword || !newPassword) {
    return { error: 'Semua field wajib diisi.' };
  }

  try {
    // 1. Ambil pengguna dan password hash-nya dari DB
    const user = await prisma.pengguna.findUnique({
      where: { id: session.operatorId },
    });

    if (!user) return { error: 'Pengguna tidak ditemukan.' };

    // 2. Verifikasi password lama
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return { error: 'Password lama Anda salah.' };
    }

    // 3. Hash dan simpan password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.pengguna.update({
      where: { id: session.operatorId },
      data: { password: hashedNewPassword },
    });

    // Log activity
    await logActivity({
      userId: session.operatorId,
      category: 'PROFILE',
      type: 'CHANGE_PASSWORD',
      description: ActivityDescriptions.PASSWORD_CHANGED(user.username),
      metadata: {
        username: user.username,
      },
    });

    return { success: 'Password berhasil diubah.' };

  } catch (error) {
    return { error: 'Gagal mengubah password.' };
  }
}