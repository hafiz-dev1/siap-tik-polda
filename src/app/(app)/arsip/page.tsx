// file: app/(app)/arsip/page.tsx

import { PrismaClient, Role } from '@prisma/client';
import SuratDashboardClient from '@/app/components/SuratDashboardClient'; // Path impor ke komponen klien
import { getSession } from '@/lib/session'; // Impor helper sesi

const prisma = new PrismaClient();

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
    <div>
      <div className="border-b pb-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Arsip Surat</h1>
        <p className="text-gray-500 mt-1">Kelola atau lihat semua arsip surat masuk dan keluar.</p>
      </div>
      
      {/* 3. Kirim 'role' dinamis ke komponen klien, bukan "ADMIN" hardcode */}
      <SuratDashboardClient suratList={suratList} role={userRole} />
    </div>
  );
}