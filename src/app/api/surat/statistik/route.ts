import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to build a 12‑month skeleton (including months with zero data)
function buildLast12MonthsMap() {
  const map: Record<string, { month: string; masuk: number; keluar: number }> = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = d.toISOString().slice(0, 7); // YYYY-MM
    const label = d.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
    map[key] = { month: label, masuk: 0, keluar: 0 };
  }
  return map;
}

export async function GET() {
  // Raw SQL for month aggregation on tanggal_diterima_dibuat (consistent with dashboard)
  const rows: Array<{
    month_start: Date;
    masuk: string;   // comes as string (count) from PG
    keluar: string;
  }> = await prisma.$queryRawUnsafe(`
    SELECT
      date_trunc('month', "tanggal_diterima_dibuat") AS month_start,
      COUNT(*) FILTER (WHERE "arah_surat" = 'MASUK')  AS masuk,
      COUNT(*) FILTER (WHERE "arah_surat" = 'KELUAR') AS keluar
    FROM "surat"
    WHERE "deletedAt" IS NULL 
      AND "tanggal_diterima_dibuat" >= date_trunc('month', CURRENT_DATE) - INTERVAL '11 months'
    GROUP BY month_start
    ORDER BY month_start ASC;
  `);

  const map = buildLast12MonthsMap();

  for (const r of rows) {
    const key = r.month_start.toISOString().slice(0, 7); // YYYY-MM
    if (map[key]) {
      map[key].masuk = Number(r.masuk);
      map[key].keluar = Number(r.keluar);
    }
  }

  const data = Object.values(map);
  return NextResponse.json(data);
}