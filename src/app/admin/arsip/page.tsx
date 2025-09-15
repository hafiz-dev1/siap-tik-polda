// file: app/admin/arsip/page.tsx

import { PrismaClient } from '@prisma/client';
import SuratDashboardClient from '../components/SuratDashboardClient';

const prisma = new PrismaClient();

export default async function ArsipPage() {
  // Halaman ini sekarang hanya mengambil data daftar surat
  const suratList = await prisma.surat.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: {
      lampiran: true,
    },
  });

  // Kita tidak lagi menghitung atau mengirimkan 'stats' dari sini
  return (
    <div>
      <SuratDashboardClient suratList={suratList} />
    </div>
  );
}