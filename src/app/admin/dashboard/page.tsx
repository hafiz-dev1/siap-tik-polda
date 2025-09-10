// file: app/admin/dashboard/page.tsx

import { PrismaClient } from '@prisma/client';
import SuratDashboardClient from '../components/SuratDashboardClient';

// Initialize the Prisma Client
const prisma = new PrismaClient();

// This is an async Server Component, allowing direct database access
export default async function DashboardPage() {
  // 1. Fetch ALL surat data from the database on the server.
  // This happens once when the page is first loaded.
  const suratList = await prisma.surat.findMany({
    // Apply the soft-delete filter to exclude "deleted" records
    where: {
      deletedAt: null,
    },
    // Order the results by the creation date, newest first
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Arsip Surat</h1>
        {/* The "+ Tambah Surat" button is now part of the client component */}
      </div>
      
      {/* 2. Render the Client Component and pass the complete 'suratList' as a prop.
          All filtering, tabbing, and searching will be handled inside this component. */}
      <SuratDashboardClient suratList={suratList} />
    </div>
  );
}