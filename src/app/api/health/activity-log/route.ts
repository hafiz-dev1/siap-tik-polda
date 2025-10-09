// Health check endpoint untuk Activity Log
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const startTime = Date.now();
  const checks: any = {
    tableExists: false,
    canRead: false,
    canWrite: false,
    totalLogs: 0,
    sampleLog: null,
  };

  try {
    // 1. Check if table exists
    const tableCheck: any = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'activity_log'
      ) as exists;
    `;
    
    checks.tableExists = tableCheck[0]?.exists || false;

    if (!checks.tableExists) {
      return NextResponse.json({
        status: 'unhealthy',
        error: 'Table activity_log does not exist',
        checks,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      }, { status: 500 });
    }

    // 2. Check column structure
    const columns: any = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'activity_log'
      ORDER BY ordinal_position;
    `;
    checks.columns = columns;

    // 3. Check if can read
    const count = await prisma.activityLog.count();
    checks.canRead = true;
    checks.totalLogs = count;

    // 4. Get sample log (latest)
    if (count > 0) {
      const sampleLog = await prisma.activityLog.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              username: true,
              nama: true,
            },
          },
        },
      });
      checks.sampleLog = {
        id: sampleLog?.id,
        category: sampleLog?.category,
        type: sampleLog?.type,
        description: sampleLog?.description,
        username: sampleLog?.user?.username,
        createdAt: sampleLog?.createdAt,
      };
    }

    // 5. Check if can write (create test log)
    const testUser = await prisma.pengguna.findFirst({
      where: { deletedAt: null },
    });

    if (testUser) {
      try {
        const testLog = await prisma.activityLog.create({
          data: {
            userId: testUser.id,
            category: 'SYSTEM',
            type: 'OTHER',
            description: '[HEALTH CHECK] System health check test',
            status: 'SUCCESS',
          },
        });
        checks.canWrite = true;
        checks.testLogId = testLog.id;

        // Clean up test log
        await prisma.activityLog.delete({
          where: { id: testLog.id },
        });
      } catch (writeError) {
        checks.canWrite = false;
        checks.writeError = writeError instanceof Error ? writeError.message : String(writeError);
      }
    }

    // All checks passed
    return NextResponse.json({
      status: 'healthy',
      checks,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      environment: process.env.NODE_ENV,
    });

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      checks,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
    }, { status: 500 });
  }
}
