// file: app/page.tsx
import { PrismaClient } from '@prisma/client';
import SuratDashboardClient from '@/app/components/SuratDashboardClient';
import { getSession } from '@/lib/session';
import PublicNavbar from '@/app/components/PublicNavbar';

const prisma = new PrismaClient();

export default async function HomePage() {
  const session = await getSession();
  let user = null;
  if (session) {
    user = await prisma.pengguna.findUnique({
      where: { id: session.operatorId },
      select: { nama: true, role: true }
    });
  }
  const suratList = await prisma.surat.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: { lampiran: true },
  });
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar user={user} />
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b pb-4 mb-8">
             <h1 className="text-3xl font-bold text-gray-900">Arsip Surat Publik</h1>
             <p className="text-gray-500 mt-1">Sistem Informasi Arsip Digital (SIAD) POLDA.</p>
          </div>
          <SuratDashboardClient suratList={suratList} role={user?.role} />
        </div>
      </main>
    </div>
  );
}