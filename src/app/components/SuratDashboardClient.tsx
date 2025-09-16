// file: app/components/SuratDashboardClient.tsx
'use client';

import { useState, useMemo } from 'react';
import { Surat, Lampiran, Role } from '@prisma/client';

// Impor semua komponen anak
import SuratFormModal from './SuratFormModal';
import DeleteSuratButton from './DeleteSuratButton';
import SuratDetailModal from './SuratDetailModal';

// Konstanta untuk membangun elemen UI
const TIPE_DOKUMEN = ['NOTA_DINAS', 'SURAT_BIASA', 'SPRIN', 'TELEGRAM'];
const TUJUAN_DISPOSISI = [
  'KASUBBID_TEKKOM',
  'KASUBBID_TEKINFO',
  'KASUBBAG_RENMIN',
  'KAUR_KEU',
];

// Tipe props yang diterima dari Server Component (termasuk peran)
type Props = {
  suratList: (Surat & { lampiran: Lampiran[] })[];
  role?: Role | null;
};

export default function SuratDashboardClient({ suratList, role }: Props) {
  // State management untuk semua UI interaktif
  const [activeTipe, setActiveTipe] = useState('ALL'); // Default ke 'Semua Tipe'
  const [activeArah, setActiveArah] = useState<'MASUK' | 'KELUAR'>('MASUK');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTujuan, setSelectedTujuan] = useState<string[]>([]);

  // Logika filter yang di-memoized untuk performa
  const filteredSurat = useMemo(() => {
    return suratList.filter((surat) => {
      // Filter "bypass" jika 'Semua Tipe' dipilih
      const tipeMatch = activeTipe === 'ALL' || surat.tipe_dokumen === activeTipe;
      
      const arahMatch = surat.arah_surat === activeArah;
      const searchMatch =
        searchQuery === '' ||
        surat.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surat.nomor_surat.toLowerCase().includes(searchQuery.toLowerCase());
      const tujuanMatch =
        selectedTujuan.length === 0 ||
        selectedTujuan.some(tujuan => surat.tujuan_disposisi.includes(tujuan));

      return tipeMatch && arahMatch && searchMatch && tujuanMatch;
    });
  }, [suratList, activeTipe, activeArah, searchQuery, selectedTujuan]);

  // Handler untuk checkbox
  const handleTujuanChange = (tujuan: string) => {
    setSelectedTujuan((prev) =>
      prev.includes(tujuan)
        ? prev.filter((t) => t !== tujuan)
        : [...prev, tujuan]
    );
  };
  
  // Helper untuk format teks
  const formatEnumText = (text: string) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Kolom Kiri: Sidebar Tipe Dokumen */}
      <aside className="w-full md:w-1/4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Tipe Dokumen</h2>
        <ul className="space-y-2">
          {/* Tombol "Semua Tipe" */}
          <li>
            <button
              onClick={() => setActiveTipe('ALL')}
              className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTipe === 'ALL'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              SEMUA TIPE
            </button>
          </li>
          {/* Tombol-tombol lainnya */}
          {TIPE_DOKUMEN.map((tipe) => (
            <li key={tipe}>
              <button
                onClick={() => setActiveTipe(tipe)}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTipe === tipe
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {formatEnumText(tipe)}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Kolom Kanan: Konten Utama */}
      <main className="w-full md:w-3/4">
        {/* Filter Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-grow w-full">
              <input
                type="text"
                placeholder="Cari perihal atau nomor surat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Tujuan Disposisi:</label>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                  {TUJUAN_DISPOSISI.map((tujuan) => (
                    <label key={tujuan} className="flex items-center space-x-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTujuan.includes(tujuan)}
                        onChange={() => handleTujuanChange(tujuan)}
                        className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-700"
                      />
                      <span className="dark:text-gray-300">{formatEnumText(tujuan.replace('KASUBBID_', '').replace('KASUBBAG_', '').replace('KAUR_', ''))}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Render Kondisional: Tombol Tambah hanya untuk ADMIN */}
            {role === 'ADMIN' && (
              <div className="flex-shrink-0 pt-1">
                <SuratFormModal />
              </div>
            )}
          </div>
        </div>

        {/* Tabs untuk Surat Masuk & Keluar */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button onClick={() => setActiveArah('MASUK')} className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${activeArah === 'MASUK' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-b-2 border-transparent'}`}>Surat Masuk</button>
          <button onClick={() => setActiveArah('KELUAR')} className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${activeArah === 'KELUAR' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-b-2 border-transparent'}`}>Surat Keluar</button>
        </div>

        {/* Tabel Data */}
        <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Detail Surat & Disposisi</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-40">Lampiran & Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSurat.length === 0 ? (
                <tr><td colSpan={2} className="text-center py-10 text-gray-500 dark:text-gray-400">Tidak ada data surat yang cocok dengan filter.</td></tr>
              ) : (
                filteredSurat.map((surat) => (
                  <SuratDetailModal key={surat.id} surat={surat}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                        <div className="flex flex-col">
                          <p className="font-bold text-gray-900 dark:text-white whitespace-no-wrap">{surat.perihal}</p>
                          <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                            <span className="font-semibold">Dari:</span> {surat.asal_surat} | <span className="font-semibold">Ke:</span> {surat.tujuan_surat}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">
                            <span className="font-semibold">Tgl Surat:</span> {new Date(surat.tanggal_surat).toLocaleDateString('id-ID')}
                          </p>
                          <p className="text-gray-800 dark:text-gray-200 text-xs mt-2 bg-gray-50 dark:bg-gray-700/50 p-1 border dark:border-gray-600 rounded truncate">
                            <span className="font-semibold">Disposisi:</span> {surat.isi_disposisi}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                        <div className="flex flex-col items-start gap-2">
                          {surat.lampiran[0] ? (
                            <a href={surat.lampiran[0].path_file} download onClick={(e) => e.stopPropagation()} className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 no-underline">Download Scan</a>
                          ) : (
                            <span className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-200 dark:text-gray-300 dark:bg-gray-600 rounded-full">No File</span>
                          )}
                          
                          {/* Render Kondisional: Tombol Aksi hanya untuk ADMIN */}
                          {role === 'ADMIN' && (
                            <div className="flex items-center space-x-4 pt-1">
                              <SuratFormModal suratToEdit={surat} />
                              <DeleteSuratButton suratId={surat.id} />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  </SuratDetailModal>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

