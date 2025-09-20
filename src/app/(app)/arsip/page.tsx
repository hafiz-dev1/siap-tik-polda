// file: app/(app)/arsip/page.tsx

import { Role } from '@prisma/client';
import SuratDashboardClient from '@/app/components/SuratDashboardClient'; // Path impor ke komponen klien
import LiveDateTime from '@/app/components/LiveDateTime';
import { getSession } from '@/lib/session'; // Impor helper sesi
import { prisma } from '@/lib/prisma';

export default async function ArsipPage() {
  // 1. Ambil sesi pengguna yang sedang aktif
  const session = await getSession();
  const userRole = session?.role as Role | null; // Dapatkan role asli pengguna (bisa ADMIN, USER, atau null)

  // 2. Ambil data surat (logika ini tidak berubah)
  const suratList = await prisma.surat.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: {
      lampiran: true,
    },
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Arsip Surat</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola atau lihat semua arsip surat masuk dan keluar.</p>
        </div>
        <LiveDateTime />
      </div>
      
      {/* 3. Kirim 'role' dinamis ke komponen klien, bukan "ADMIN" hardcode */}
      <SuratDashboardClient suratList={suratList} role={userRole} suratId={''} />
    </div>
  );
}