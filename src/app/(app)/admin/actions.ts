// file: app/admin/actions.ts
'use server';

import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';
import { getSession } from '@/lib/session';

const prisma = new PrismaClient();

/**
 * Menangani proses logout pengguna (Admin dan User).
 */
export async function logout() {
  const cookieStore = await cookies(); // Menggunakan await sesuai kebutuhan lingkungan Anda
  cookieStore.delete('token');
  redirect('/login');
}

/**
 * Membuat data surat baru. Hanya bisa dilakukan oleh ADMIN.
 */
export async function createSurat(formData: FormData) {
  // --- ROLE GUARD ---
  const session = await getSession();
  if (!session?.operatorId || session.role !== 'ADMIN') {
    return { message: 'Gagal: Anda tidak memiliki hak akses untuk aksi ini.' };
  }
  // --- AKHIR ROLE GUARD ---

  try {
    const nomor_agenda = formData.get('nomor_agenda') as string;
    const tanggal_diterima_dibuat = new Date(formData.get('tanggal_diterima_dibuat') as string);
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
      return { message: 'Gagal: Scan surat wajib diupload.' };
    }

    // Logika upload file
    const buffer = Buffer.from(await scan_surat.arrayBuffer());
    const filename = `${Date.now()}-${scan_surat.name.replace(/\s/g, '_')}`;
    const uploadPath = path.join(process.cwd(), 'public/uploads', filename);
    await fs.mkdir(path.dirname(uploadPath), { recursive: true });
    await fs.writeFile(uploadPath, buffer);
    const publicPath = `/uploads/${filename}`;

    await prisma.surat.create({
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

  } catch (error) {
    console.error('Gagal membuat surat:', error);
    if (error instanceof Error) {
        return { message: `Gagal membuat surat: ${error.message}` };
    }
    return { message: 'Gagal membuat surat karena kesalahan tak terduga.' };
  }

  revalidatePath('/arsip'); // Merevalidasi halaman arsip baru
  revalidatePath('/dashboard'); // Merevalidasi dashboard (untuk statistik)
  return { message: 'Surat berhasil ditambahkan.' };
}

/**
 * Melakukan soft delete pada surat. Hanya bisa dilakukan oleh ADMIN.
 */
export async function deleteSurat(suratId: string) {
  // --- ROLE GUARD ---
  const session = await getSession();
  if (!session?.operatorId || session.role !== 'ADMIN') {
    return { message: 'Gagal: Anda tidak memiliki hak akses untuk aksi ini.' };
  }
  // --- AKHIR ROLE GUARD ---

  try {
    if (!suratId) {
      return { message: 'Gagal: ID Surat tidak valid.' };
    }
    await prisma.surat.update({
      where: {
        id: suratId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Gagal menghapus surat:', error);
    return { message: 'Gagal menghapus surat.' };
  }

  revalidatePath('/arsip');
  revalidatePath('/dashboard');
  return { message: 'Surat berhasil dihapus.' };
}

/**
 * Memperbarui data surat yang ada. Hanya bisa dilakukan oleh ADMIN.
 */
export async function updateSurat(suratId: string, formData: FormData) {
  // --- ROLE GUARD ---
  const session = await getSession();
  if (!session?.operatorId || session.role !== 'ADMIN') {
    return { message: 'Gagal: Anda tidak memiliki hak akses untuk aksi ini.' };
  }
  // --- AKHIR ROLE GUARD ---

  try {
    if (!suratId) {
      return { message: 'Gagal: ID Surat tidak valid.' };
    }
    
    // Ekstrak data dari form
    const nomor_agenda = formData.get('nomor_agenda') as string;
    const tanggal_diterima_dibuat = new Date(formData.get('tanggal_diterima_dibuat') as string);
    const nomor_surat = formData.get('nomor_surat') as string;
    const tanggal_surat = new Date(formData.get('tanggal_surat') as string);
    const perihal = formData.get('perihal') as string;
    const asal_surat = formData.get('asal_surat') as string;
    const tujuan_surat = formData.get('tujuan_surat') as string;
    const arah_surat = formData.get('arah_surat') as any;
    const tipe_dokumen = formData.get('tipe_dokumen') as any;
    const tujuan_disposisi = formData.getAll('tujuan_disposisi') as string[];
    const isi_disposisi = formData.get('isi_disposisi') as string;
    
    await prisma.surat.update({
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

  } catch (error) {
    console.error('Gagal memperbarui surat:', error);
    return { message: 'Gagal memperbarui surat.' };
  }

  revalidatePath('/arsip');
  revalidatePath('/dashboard');
  return { message: 'Surat berhasil diperbarui.' };
}