// file: app/admin/dashboard/page.tsx

import { Prisma, PrismaClient } from '@prisma/client';
import Link from 'next/link';
import StatsCard from '@/app/components/StatsCard'; // Menggunakan path alias yang benar
import SuratChart from '@/app/components/SuratChart'; // Menggunakan path alias yang benar

const prisma = new PrismaClient();

const TUJUAN_DISPOSISI = [
  'KASUBBID_TEKKOM',
  'KASUBBID_TEKINFO',
  'KASUBBAG_RENMIN',
  'KAUR_KEU',
];

const formatEnumText = (text: string) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

// Fungsi untuk menyiapkan data diagram
async function getChartData() {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const rawData: { month: Date, arah_surat: 'MASUK' | 'KELUAR', count: BigInt }[] = await prisma.$queryRaw`
    SELECT
      DATE_TRUNC('month', "createdAt") as month,
      "arah_surat",
      COUNT(*) as count
    FROM "surat"
    WHERE "deletedAt" IS NULL AND "createdAt" >= ${twelveMonthsAgo}
    GROUP BY month, "arah_surat"
    ORDER BY month;
  `;

  const monthlyData: Record<string, { month: string; masuk: number; keluar: number }> = {};
  const monthFormatter = new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'short' });

  // Inisialisasi 12 bulan terakhir untuk memastikan semua bulan ada di chart
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = monthFormatter.format(d);
    monthlyData[monthKey] = { month: monthKey, masuk: 0, keluar: 0 };
  }

  // Isi data dari hasil query
  rawData.forEach(item => {
    const monthKey = monthFormatter.format(new Date(item.month));
    if (monthlyData[monthKey]) {
      if (item.arah_surat === 'MASUK') {
        monthlyData[monthKey].masuk = Number(item.count);
      } else if (item.arah_surat === 'KELUAR') {
        monthlyData[monthKey].keluar = Number(item.count);
      }
    }
  });

  return Object.values(monthlyData);
}

export default async function DashboardPage() {
  // Mengambil semua data yang dibutuhkan secara bersamaan untuk efisiensi
  const [
    totalMasuk, 
    totalKeluar, 
    totalDokumen, 
    chartData, 
    recentSurat,
    disposisiCountsData
  ] = await Promise.all([
    prisma.surat.count({ where: { arah_surat: 'MASUK', deletedAt: null } }),
    prisma.surat.count({ where: { arah_surat: 'KELUAR', deletedAt: null } }),
    prisma.surat.count({ where: { deletedAt: null } }),
    getChartData(),
    prisma.surat.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.surat.findMany({
      where: { deletedAt: null },
      select: { tujuan_disposisi: true },
    }),
  ]);

  // Memproses data untuk rincian disposisi
  const disposisiCounts = TUJUAN_DISPOSISI.reduce((acc, tujuan) => {
    acc[tujuan] = 0;
    return acc;
  }, {} as Record<string, number>);

  disposisiCountsData.forEach(surat => {
    surat.tujuan_disposisi.forEach(tujuan => {
      if (disposisiCounts.hasOwnProperty(tujuan)) {
        disposisiCounts[tujuan]++;
      }
    });
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link href="/arsip" className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          Buka Arsip Surat
        </Link>
      </div>

      {/* Kartu Statistik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Surat Masuk" value={totalMasuk} />
        <StatsCard title="Total Surat Keluar" value={totalKeluar} />
        <StatsCard title="Total Semua Dokumen" value={totalDokumen} />
      </div>

      {/* Tata Letak Utama Dashboard (Grid 3 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri (mengambil 2 bagian grid) */}
        <div className="lg:col-span-2">
          <SuratChart data={chartData} />
        </div>

        {/* Kolom Kanan (mengambil 1 bagian grid) */}
        <div className="space-y-8">
          {/* Panel Rincian Disposisi */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Rincian Disposisi</h3>
            <ul className="mt-4 space-y-3">
              {Object.entries(disposisiCounts).map(([tujuan, count]) => (
                <li key={tujuan} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{formatEnumText(tujuan.replace('KASUBBID_', '').replace('KASUBBAG_', '').replace('KAUR_', ''))}</span>
                  <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">{count}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Panel Aktivitas Terbaru */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Aktivitas Terbaru</h3>
            <ul className="mt-4 space-y-4">
              {recentSurat.length > 0 ? (
                recentSurat.map(surat => (
                  <li key={surat.id} className="text-sm">
                    <p className="font-semibold text-gray-800 truncate">{surat.perihal}</p>
                    <p className="text-xs text-gray-500">
                      No. Agenda: {surat.nomor_agenda} - Dibuat pada {new Date(surat.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-500">Belum ada aktivitas.</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}