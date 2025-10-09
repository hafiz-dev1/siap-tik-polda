// file: src/lib/activityLogger.ts
import { prisma } from '@/lib/prisma';

// Activity Categories
export type ActivityCategory = 'AUTH' | 'SURAT' | 'USER' | 'PROFILE' | 'TRASH' | 'SYSTEM';

// Activity Types  
export type ActivityType = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'RESTORE'
  | 'PERMANENT_DELETE'
  | 'BULK_DELETE'
  | 'BULK_RESTORE'
  | 'BULK_PERMANENT_DELETE'
  | 'VIEW'
  | 'DOWNLOAD'
  | 'UPLOAD'
  | 'PASSWORD_CHANGE'
  | 'PROFILE_UPDATE'
  | 'OTHER';

interface LogActivityParams {
  userId: string;
  category: ActivityCategory;
  type: ActivityType;
  description: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status?: 'SUCCESS' | 'FAILED' | 'WARNING';
}

/**
 * Helper function untuk mencatat aktivitas pengguna
 */
export async function logActivity(params: LogActivityParams) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        category: params.category,
        type: params.type,
        description: params.description,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : null,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        status: params.status || 'SUCCESS',
      },
    });
  } catch (error) {
    // Log error tapi jangan throw agar tidak mengganggu operasi utama
    console.error('Failed to log activity:', error);
  }
}

/**
 * Helper untuk mendapatkan IP Address dari request
 */
export function getIpAddress(request?: Request): string | undefined {
  if (!request) return undefined;
  
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return undefined;
}

/**
 * Helper untuk mendapatkan User Agent dari request
 */
export function getUserAgent(request?: Request): string | undefined {
  if (!request) return undefined;
  return request.headers.get('user-agent') || undefined;
}

/**
 * Template deskripsi untuk berbagai aktivitas
 */
export const ActivityDescriptions = {
  // Auth
  LOGIN_SUCCESS: (username: string) => `User ${username} berhasil login`,
  LOGOUT: (username: string) => `User ${username} logout`,
  LOGIN_FAILED: (username: string) => `Percobaan login gagal untuk user ${username}`,

  // Surat
  SURAT_CREATED: (nomorSurat: string, perihal: string) => 
    `Membuat surat baru: ${nomorSurat} - ${perihal}`,
  SURAT_UPDATED: (nomorSurat: string) => 
    `Mengupdate surat: ${nomorSurat}`,
  SURAT_DELETED: (nomorSurat: string) => 
    `Menghapus surat ke trash: ${nomorSurat}`,
  SURAT_RESTORED: (nomorSurat: string) => 
    `Memulihkan surat dari trash: ${nomorSurat}`,
  SURAT_PERMANENT_DELETE: (nomorSurat: string) => 
    `Menghapus permanen surat: ${nomorSurat}`,
  SURAT_BULK_DELETE: (count: number) => 
    `Menghapus ${count} surat ke trash`,
  SURAT_BULK_RESTORE: (count: number) => 
    `Memulihkan ${count} surat dari trash`,
  SURAT_BULK_PERMANENT_DELETE: (count: number) => 
    `Menghapus permanen ${count} surat`,
  SURAT_VIEWED: (nomorSurat: string) => 
    `Melihat detail surat: ${nomorSurat}`,
  SURAT_DOWNLOADED: (nomorSurat: string) => 
    `Mengunduh lampiran surat: ${nomorSurat}`,

  // User
  USER_CREATED: (username: string, nama: string) => 
    `Membuat user baru: ${username} (${nama})`,
  USER_UPDATED: (username: string) => 
    `Mengupdate user: ${username}`,
  USER_DELETED: (username: string) => 
    `Menghapus user ke trash: ${username}`,
  USER_RESTORED: (username: string) => 
    `Memulihkan user dari trash: ${username}`,
  USER_PERMANENT_DELETE: (username: string) => 
    `Menghapus permanen user: ${username}`,
  USER_BULK_DELETE: (count: number) => 
    `Menghapus ${count} user ke trash`,
  USER_BULK_RESTORE: (count: number) => 
    `Memulihkan ${count} user dari trash`,
  USER_BULK_PERMANENT_DELETE: (count: number) => 
    `Menghapus permanen ${count} user`,

  // Profile
  PROFILE_UPDATED: (username: string) => 
    `Mengupdate profil: ${username}`,
  PASSWORD_CHANGED: (username: string) => 
    `Mengganti password: ${username}`,
  PROFILE_PICTURE_UPDATED: (username: string) => 
    `Mengupdate foto profil: ${username}`,

  // System
  SYSTEM_PURGE_TRASH: (count: number) => 
    `Sistem otomatis menghapus ${count} item kadaluarsa dari trash`,
};
