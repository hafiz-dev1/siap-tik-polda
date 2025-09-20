// file: app/admin/dashboard/page.tsx

import { Prisma } from '@prisma/client';
import Link from 'next/link';
import StatsCard from '@/app/components/StatsCard';
import SuratChart from '@/app/components/SuratChart';
import SuratDetailModal from '@/app/components/SuratDetailModal';
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';

const TUJUAN_DISPOSISI = [
  'KASUBBID_TEKKOM',
  'KASUBBID_TEKINFO',
  'KASUBBAG_RENMIN',
  'KAUR_KEU',
];

const formatEnumText = (text: string) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

// Fungsi untuk menyiapkan data diagram
async function getChartData() {
  // Get data for the last 12 months using raw SQL for better performance
  const rawData: Array<{
    month_start: Date;
    masuk: string;   // comes as string (count) from PostgreSQL
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

  // Initialize a map with all 12 months to ensure no gaps in the chart
  const monthlyData: Record<string, { month: string; masuk: number; keluar: number }> = {};
  const monthFormatter = new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'short' });
  
  // Create skeleton for last 12 months
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = monthFormatter.format(date);
    monthlyData[monthKey] = { month: monthKey, masuk: 0, keluar: 0 };
  }

  // Fill in actual data from query results
  rawData.forEach(item => {
    const monthKey = monthFormatter.format(new Date(item.month_start));
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].masuk = Number(item.masuk);
      monthlyData[monthKey].keluar = Number(item.keluar);
    }
  });

  return Object.values(monthlyData);
}

// Loading component for chart
const ChartSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
    <div className="h-6 bg-gray-200 rounded-lg w-1/3 mb-6"></div>
    <div className="h-72 bg-gray-200 rounded-lg"></div>
  </div>
);

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
      include: { lampiran: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.surat.findMany({
      where: { deletedAt: null },
      select: { tujuan_disposisi: true, arah_surat: true },
    }),
  ]);

  // Memproses data untuk rincian disposisi
  const disposisiCounts = TUJUAN_DISPOSISI.reduce((acc, tujuan) => {
    acc[tujuan] = { masuk: 0, keluar: 0, total: 0 };
    return acc;
  }, {} as Record<string, { masuk: number; keluar: number; total: 0 }>);

  disposisiCountsData.forEach(surat => {
    surat.tujuan_disposisi.forEach(tujuan => {
      if (disposisiCounts.hasOwnProperty(tujuan)) {
        if (surat.arah_surat === 'MASUK') {
          disposisiCounts[tujuan].masuk++;
        } else {
          disposisiCounts[tujuan].keluar++;
        }
        disposisiCounts[tujuan].total++;
      }
    });
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Selamat datang! Pantau statistik dan aktivitas surat.</p>
        </div>
        <Link href="/arsip" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
           <span>Buka Arsip Surat</span>
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
           </svg>
         </Link>
       </div>

       {/* Kartu Statistik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        <StatsCard title="Total Surat Masuk" value={totalMasuk} type="inbox" />
        <StatsCard title="Total Surat Keluar" value={totalKeluar} type="outbox" />
        <StatsCard title="Total Semua Dokumen" value={totalDokumen} type="document" />
      </div>

      {/* Chart dan Rincian Disposisi (Grid 2 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri - Chart (mengambil 2 bagian grid) */}
        <div className="lg:col-span-2">
          <Suspense fallback={<ChartSkeleton />}>
            <div className="animate-fade-in delay-100">
              <SuratChart initialData={chartData} />
            </div>
          </Suspense>
        </div>

        {/* Kolom Kanan - Rincian Disposisi */}
        <div className="animate-slide-up">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 h-full flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 mb-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Rincian Disposisi</h3>
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            </div>
            <ul className="space-y-3 overflow-y-auto -mr-2 pr-2">
              {Object.entries(disposisiCounts).map(([tujuan, count]) => (
                <li key={tujuan} className="flex justify-between items-center text-sm transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-3 rounded-lg group">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg w-8 h-8 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 dark:text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25m-18 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v2.25m-18 0h18M5.25 6.375l4.16-2.102a.75.75 0 01.88 0l4.16 2.102m-9.2 0l4.16 2.102a.75.75 0 00.88 0l4.16-2.102" />
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200">
                      {formatEnumText(tujuan.replace('KASUBBID_', '').replace('KASUBBAG_', '').replace('KAUR_', ''))}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-600 dark:text-blue-400" title="Surat Masuk">{count.masuk}</span>
                    <span className="text-gray-300 dark:text-gray-600">/</span>
                    <span className="font-semibold text-green-600 dark:text-green-400" title="Surat Keluar">{count.keluar}</span>
                    <span className="font-bold text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 group-hover:text-indigo-800 dark:group-hover:text-indigo-300 min-w-[2.5rem] text-center">
                      {count.total}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Panel Aktivitas Terbaru (Full Width) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 animate-fade-in delay-200">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Aktivitas Terbaru</h3>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        
        {recentSurat.length > 0 ? (
          <div className="relative">
            <div className="overflow-auto max-h-80 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
              <table className="min-w-full table-fixed">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-20">
                  <tr>
                    <th className="w-16 px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">No.</th>
                    <th className="w-2/5 px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Perihal</th>
                    <th className="w-24 px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Arah</th>
                    <th className="w-32 px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
                    <th className="w-24 px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                  {recentSurat.map((surat, index) => (
                    <SuratDetailModal key={surat.id} surat={surat}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer">
                        <td className="w-16 px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {index + 1}
                        </td>
                        <td className="w-2/5 px-6 py-4">
                          <div className="text-sm font-medium text-gray-800 dark:text-white">
                            <div className="truncate" title={surat.perihal}>{surat.perihal}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{surat.nomor_surat}</div>
                          </div>
                        </td>
                        <td className="w-24 px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                            surat.arah_surat === 'MASUK' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300' 
                              : 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300'
                          }`}>
                            {surat.arah_surat === 'MASUK' ? 'Masuk' : 'Keluar'}
                          </span>
                        </td>
                        <td className="w-32 px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(surat.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="w-24 px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            Aktif
                          </span>
                        </td>
                      </tr>
                    </SuratDetailModal>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Belum Ada Aktivitas</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Surat yang baru ditambahkan akan muncul di sini.</p>
          </div>
        )}
      </div>
     </div>
   );
}