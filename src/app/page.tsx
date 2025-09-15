// file: app/page.tsx

import { PrismaClient } from '@prisma/client';
import PublicSuratDashboard from './components/PublicSuratDashboard';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function HomePage() {
  // Mengambil data persis seperti di dashboard admin
  const suratList = await prisma.surat.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: {
      lampiran: true,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center border-b pb-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Arsip Surat Digital</h1>
          <p className="text-gray-500 mt-1">Sistem Informasi Arsip Digital (SIAD) POLDA</p>
        </div>
        <Link href="/login" className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50">
          Admin Login
        </Link>
      </header>

      <PublicSuratDashboard suratList={suratList} />
    </div>
  );
}