// file: app/(app)/admin/trash/page.tsx

import { PrismaClient } from '@prisma/client';
import TrashActionButtons from '@/app/components/TrashActionButtons'; // Impor komponen aksi

const prisma = new PrismaClient();

export default async function TrashPage() {
  // Ambil data surat yang hanya sudah di-soft-delete
  const deletedSuratList = await prisma.surat.findMany({
    where: {
      deletedAt: {
        not: null, // Hanya ambil yang deletedAt-nya TIDAK NULL
      },
    },
    orderBy: {
      deletedAt: 'desc',
    },
  });

  return (
    <div>
      <div className="border-b pb-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tempat Sampah</h1>
        <p className="text-gray-500 mt-1">Data surat yang telah dihapus. Data di sini dapat dipulihkan atau dihapus secara permanen.</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold uppercase">Perihal</th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold uppercase">Tanggal Dihapus</th>
              <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {deletedSuratList.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-10 text-gray-500">Tempat sampah kosong.</td>
              </tr>
            ) : (
              deletedSuratList.map((surat) => (
                <tr key={surat.id} className="hover:bg-gray-50">
                  <td className="px-5 py-5 border-b text-sm">
                    <p className="font-semibold">{surat.perihal}</p>
                    <p className="text-xs text-gray-600">{surat.nomor_surat}</p>
                  </td>
                  <td className="px-5 py-5 border-b text-sm">
                    <p>{new Date(surat.deletedAt!).toLocaleString('id-ID')}</p>
                  </td>
                  <td className="px-5 py-5 border-b text-sm">
                    <TrashActionButtons suratId={surat.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}