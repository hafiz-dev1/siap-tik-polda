// file: app/admin/dashboard/page.tsx

import { Prisma, PrismaClient } from '@prisma/client';
import Link from 'next/link';
import StatsCard from '@/app/components/StatsCard';
import SuratChart from '@/app/components/SuratChart';
import SuratDetailModal from '@/app/components/SuratDetailModal';
import { Suspense } from 'react';

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
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Kelola dan pantau surat masuk dan keluar</p>
        </div>
        <Link href="/arsip" className="inline-flex items-center justify-center px-5 py-2.5 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md">
           Buka Arsip Surat
         </Link>
       </div>

       {/* Kartu Statistik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        <StatsCard title="Total Surat Masuk" value={totalMasuk} />
        <StatsCard title="Total Surat Keluar" value={totalKeluar} />
        <StatsCard title="Total Semua Dokumen" value={totalDokumen} />
      </div>

      {/* Chart dan Rincian Disposisi (Grid 2 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri - Chart (mengambil 2 bagian grid) */}
        <div className="lg:col-span-2">
          <Suspense fallback={<ChartSkeleton />}>
            <div className="animate-fade-in delay-100">
              <SuratChart data={chartData} />
            </div>
          </Suspense>
        </div>

        {/* Kolom Kanan - Rincian Disposisi */}
        <div className="animate-slide-up">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-gray-200 h-fit">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Rincian Disposisi</h3>
              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
            </div>
            <ul className="space-y-3">
              {Object.entries(disposisiCounts).map(([tujuan, count]) => (
                <li key={tujuan} className="flex justify-between items-center text-sm transition-all duration-200 hover:bg-gray-50 p-3 rounded-lg group">
                  <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-200">
                    {formatEnumText(tujuan.replace('KASUBBID_', '').replace('KASUBBAG_', '').replace('KAUR_', ''))}
                  </span>
                  <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg text-xs transition-all duration-200 group-hover:bg-indigo-100 group-hover:text-indigo-800 min-w-[2.5rem] text-center">
                    {count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Panel Aktivitas Terbaru (Full Width) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-gray-200 animate-fade-in delay-200">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">Aktivitas Terbaru</h3>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        
        {recentSurat.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No.</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Perihal</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Arah</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentSurat.map((surat, index) => (
                  <SuratDetailModal key={surat.id} surat={surat}>
                    <tr className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          <div className="max-w-xs truncate">{surat.perihal}</div>
                          <div className="text-xs text-gray-500">{surat.nomor_surat}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          surat.arah_surat === 'MASUK' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {surat.arah_surat === 'MASUK' ? 'Masuk' : 'Keluar'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(surat.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Aktif
                        </span>
                      </td>
                    </tr>
                  </SuratDetailModal>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-gray-500">Belum ada aktivitas terbaru</p>
          </div>
        )}
      </div>
     </div>
   );
}