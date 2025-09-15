// file: app/admin/arsip/page.tsx
import { PrismaClient } from '@prisma/client';
import SuratDashboardClient from '@/app/components/SuratDashboardClient';

const prisma = new PrismaClient();

export default async function ArsipPage() {
  const suratList = await prisma.surat.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: { lampiran: true },
  });
  return (
    <div>
      <div className="border-b pb-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Arsip Surat</h1>
        <p className="text-gray-500 mt-1">Kelola semua arsip surat masuk dan keluar.</p>
      </div>
      <SuratDashboardClient suratList={suratList} role="ADMIN" />
    </div>
  );
}