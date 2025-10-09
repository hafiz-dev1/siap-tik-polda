// file: src/app/(app)/log-activity/actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import type { ActivityCategory, ActivityType } from '@/lib/activityLogger';

interface GetActivityLogsParams {
  page?: number;
  limit?: number;
  category?: ActivityCategory;
  type?: ActivityType;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

/**
 * Mendapatkan activity logs dengan filter dan pagination
 */
export async function getActivityLogs(params: GetActivityLogsParams = {}) {
  const session = await getSession();
  
  if (!session?.operatorId) {
    return { error: 'Unauthorized' };
  }

  const {
    page = 1,
    limit = 50,
    category,
    type,
    startDate,
    endDate,
    userId,
  } = params;

  try {
    const skip = (page - 1) * limit;

    // Build filter
    const where: any = {};

    // Jika bukan SUPER_ADMIN, hanya bisa lihat log sendiri
    if (session.role !== 'SUPER_ADMIN') {
      where.userId = session.operatorId;
    } else if (userId) {
      where.userId = userId;
    }

    if (category) {
      where.category = category;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              nama: true,
              username: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return {
      logs: logs.map(log => ({
        ...log,
        metadata: log.metadata ? JSON.parse(JSON.stringify(log.metadata)) : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return { error: 'Failed to fetch activity logs' };
  }
}

/**
 * Mendapatkan statistik activity logs
 */
export async function getActivityStats() {
  const session = await getSession();
  
  if (!session?.operatorId) {
    return { error: 'Unauthorized' };
  }

  try {
    // Filter berdasarkan role
    const where: any = session.role !== 'SUPER_ADMIN' 
      ? { userId: session.operatorId } 
      : {};

    const [
      totalLogs,
      todayLogs,
      categoryStats,
      typeStats,
      recentActivities,
    ] = await Promise.all([
      // Total logs
      prisma.activityLog.count({ where }),
      
      // Logs hari ini
      prisma.activityLog.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      
      // Stats per kategori
      prisma.activityLog.groupBy({
        by: ['category'],
        where,
        _count: true,
      }),
      
      // Stats per tipe
      prisma.activityLog.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),
      
      // 10 aktivitas terakhir
      prisma.activityLog.findMany({
        where,
        include: {
          user: {
            select: {
              nama: true,
              username: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),
    ]);

    return {
      totalLogs,
      todayLogs,
      categoryStats: categoryStats.map(stat => ({
        category: stat.category,
        count: stat._count,
      })),
      typeStats: typeStats.map(stat => ({
        type: stat.type,
        count: stat._count,
      })),
      recentActivities: recentActivities.map(activity => ({
        ...activity,
        metadata: activity.metadata ? JSON.parse(JSON.stringify(activity.metadata)) : null,
      })),
    };
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    return { error: 'Failed to fetch activity stats' };
  }
}

/**
 * Export activity logs ke CSV
 */
export async function exportActivityLogsToCSV(params: GetActivityLogsParams = {}) {
  const session = await getSession();
  
  if (!session?.operatorId) {
    return { error: 'Unauthorized' };
  }

  const { category, type, startDate, endDate, userId } = params;

  try {
    // Build filter (sama dengan getActivityLogs)
    const where: any = {};

    if (session.role !== 'SUPER_ADMIN') {
      where.userId = session.operatorId;
    } else if (userId) {
      where.userId = userId;
    }

    if (category) {
      where.category = category;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            nama: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Generate CSV content
    const headers = [
      'Tanggal & Waktu',
      'Pengguna',
      'Username',
      'Role',
      'Kategori',
      'Tipe',
      'Deskripsi',
      'Status',
      'IP Address',
    ];

    const rows = logs.map(log => [
      new Date(log.createdAt).toLocaleString('id-ID'),
      log.user.nama,
      log.user.username,
      log.user.role,
      log.category,
      log.type,
      log.description,
      log.status,
      log.ipAddress || '-',
    ]);

    // Create CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => {
          // Escape quotes and wrap in quotes if contains comma
          const cellStr = String(cell);
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      ),
    ].join('\n');

    // Add BOM for Excel UTF-8 compatibility
    const csvWithBOM = '\ufeff' + csvContent;

    // Generate filename dengan format: Log_Aktivitas_DD-MM-YYYY_HH-MM-SS
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const filename = `Log_Aktivitas_${day}-${month}-${year}_${hours}-${minutes}-${seconds}.csv`;

    return {
      csv: csvWithBOM,
      filename,
    };
  } catch (error) {
    console.error('Error exporting activity logs:', error);
    return { error: 'Failed to export activity logs' };
  }
}

/**
 * Mendapatkan daftar users untuk filter (hanya untuk SUPER_ADMIN)
 */
export async function getUsersForFilter() {
  const session = await getSession();
  
  if (!session?.operatorId || session.role !== 'SUPER_ADMIN') {
    return { error: 'Unauthorized' };
  }

  try {
    const users = await prisma.pengguna.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
      },
      orderBy: {
        nama: 'asc',
      },
    });

    return { users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { error: 'Failed to fetch users' };
  }
}

/**
 * Clear/Reset activity logs (hanya untuk SUPER_ADMIN)
 * @param options - Filter untuk log yang akan dihapus
 */
export async function clearActivityLogs(options?: {
  olderThanDays?: number;
  category?: ActivityCategory;
  type?: ActivityType;
  userId?: string;
}) {
  const session = await getSession();
  
  if (!session?.operatorId || session.role !== 'SUPER_ADMIN') {
    return { error: 'Unauthorized - Only Super Admin can clear logs' };
  }

  try {
    // Build filter
    const where: any = {};

    if (options?.olderThanDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - options.olderThanDays);
      where.createdAt = { lte: cutoffDate };
    }

    if (options?.category) {
      where.category = options.category;
    }

    if (options?.type) {
      where.type = options.type;
    }

    if (options?.userId) {
      where.userId = options.userId;
    }

    // Count logs yang akan dihapus
    const count = await prisma.activityLog.count({ where });

    if (count === 0) {
      return { success: true, count: 0, message: 'No logs found to delete' };
    }

    // Delete logs
    await prisma.activityLog.deleteMany({ where });

    // Log aktivitas clear logs
    const { logActivity } = await import('@/lib/activityLogger');
    await logActivity({
      userId: session.operatorId,
      category: 'SYSTEM',
      type: 'DELETE',
      description: `${session.username} cleared ${count} activity log(s)${
        options?.olderThanDays ? ` older than ${options.olderThanDays} days` : ''
      }${options?.category ? ` with category ${options.category}` : ''}${
        options?.type ? ` with type ${options.type}` : ''
      }`,
      metadata: {
        deletedCount: count,
        filters: options || {},
      },
      status: 'SUCCESS',
    });

    return { 
      success: true, 
      count, 
      message: `Successfully cleared ${count} activity log(s)` 
    };
  } catch (error) {
    console.error('Error clearing activity logs:', error);
    return { error: 'Failed to clear activity logs' };
  }
}

/**
 * Clear ALL activity logs (hanya untuk SUPER_ADMIN)
 * Menghapus semua log tanpa filter - DANGEROUS!
 */
export async function clearAllActivityLogs() {
  const session = await getSession();
  
  if (!session?.operatorId || session.role !== 'SUPER_ADMIN') {
    return { error: 'Unauthorized - Only Super Admin can clear all logs' };
  }

  try {
    // Count total logs
    const count = await prisma.activityLog.count();

    if (count === 0) {
      return { success: true, count: 0, message: 'No logs to delete' };
    }

    // Delete ALL logs
    await prisma.activityLog.deleteMany({});

    // Log aktivitas (ini akan jadi satu-satunya log setelah clear all)
    const { logActivity } = await import('@/lib/activityLogger');
    await logActivity({
      userId: session.operatorId,
      category: 'SYSTEM',
      type: 'DELETE',
      description: `${session.username} cleared ALL activity logs (${count} records)`,
      metadata: {
        deletedCount: count,
        action: 'CLEAR_ALL',
      },
      status: 'SUCCESS',
    });

    return { 
      success: true, 
      count, 
      message: `Successfully cleared all ${count} activity log(s)` 
    };
  } catch (error) {
    console.error('Error clearing all activity logs:', error);
    return { error: 'Failed to clear all activity logs' };
  }
}

