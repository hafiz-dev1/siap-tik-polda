// file: app/admin/components/SuratDashboardClient.tsx
'use client';

import { useState, useMemo } from 'react';
import { SuratType } from '../types';
import SuratFormModal from './SuratFormModal';
import DeleteSuratButton from './DeleteSuratButton';

// Constants for building the UI
const TIPE_DOKUMEN = ['NOTA_DINAS', 'SURAT_BIASA', 'SPRIN', 'TELEGRAM'];
const TUJUAN_DISPOSISI = [
  'KASUBBID_TEKKOM',
  'KASUBBID_TEKINFO',
  'KASUBBAG_RENMIN',
  'KAUR_KEU',
];

// Define the props for this component
type Props = {
  suratList: SuratType[];
};

export default function SuratDashboardClient({ suratList }: Props) {
  // State management for UI interactivity
  const [activeTipe, setActiveTipe] = useState('NOTA_DINAS');
  const [activeArah, setActiveArah] = useState<'MASUK' | 'KELUAR'>('MASUK');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTujuan, setSelectedTujuan] = useState<string[]>([]);

  // Memoized filtering logic for performance
  const filteredSurat = useMemo(() => {
    return suratList.filter((surat) => {
      const tipeMatch = surat.tipe_dokumen === activeTipe;
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

  // Handler for checkbox changes
  const handleTujuanChange = (tujuan: string) => {
    setSelectedTujuan((prev) =>
      prev.includes(tujuan)
        ? prev.filter((t) => t !== tujuan)
        : [...prev, tujuan]
    );
  };
  
  // Helper to format enum text for display
  const formatEnumText = (text: string) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left Column: Document Type Sidebar */}
      <aside className="w-full md:w-1/4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tipe Dokumen</h2>
        <ul className="space-y-2">
          {TIPE_DOKUMEN.map((tipe) => (
            <li key={tipe}>
              <button
                onClick={() => setActiveTipe(tipe)}
                className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTipe === tipe
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {formatEnumText(tipe)}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Right Column: Main Content */}
      <main className="w-full md:w-3/4">
        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="flex-grow w-full">
              <input
                type="text"
                placeholder="Cari perihal atau nomor surat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700">Filter Tujuan Disposisi:</label>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                  {TUJUAN_DISPOSISI.map((tujuan) => (
                    <label key={tujuan} className="flex items-center space-x-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTujuan.includes(tujuan)}
                        onChange={() => handleTujuanChange(tujuan)}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                      />
                      <span>{formatEnumText(tujuan.replace('KASUBBID_', '').replace('KASUBBAG_', '').replace('KAUR_', ''))}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 pt-1">
              {/* SuratFormModal for "Add" mode */}
              <SuratFormModal>
                <button className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  + Tambah Surat Baru
                </button>
              </SuratFormModal>
            </div>
          </div>
        </div>

        {/* Tabs for Incoming & Outgoing Mail */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveArah('MASUK')}
            className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              activeArah === 'MASUK'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
            }`}
          >
            Surat Masuk
          </button>
          <button
            onClick={() => setActiveArah('KELUAR')}
            className={`px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              activeArah === 'KELUAR'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
            }`}
          >
            Surat Keluar
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-b-lg shadow overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Detail Surat
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tanggal Diterima
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSurat.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-gray-500">
                    Tidak ada data surat yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredSurat.map((surat) => (
                  <tr key={surat.id} className="hover:bg-gray-50">
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 font-semibold whitespace-no-wrap">{surat.perihal}</p>
                      <p className="text-gray-600 text-xs mt-1 whitespace-no-wrap">No. Agenda: {surat.nomor_agenda}</p>
                      <p className="text-gray-600 text-xs mt-1 whitespace-no-wrap">No. Surat: {surat.nomor_surat}</p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">
                        {new Date(surat.tanggal_diterima_dibuat).toLocaleDateString('id-ID', {
                          year: 'numeric', month: 'long', day: 'numeric',
                          timeZone: 'Asia/Jakarta'
                        })}
                      </p>
                      <p className="text-gray-600 text-xs mt-1 whitespace-no-wrap">
                        Pukul {new Date(surat.tanggal_diterima_dibuat).toLocaleTimeString('id-ID', {
                          hour: '2-digit', minute: '2-digit',
                          timeZone: 'Asia/Jakarta'
                        })} WIB
                      </p>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <div className="flex items-center space-x-4">
                        {/* SuratFormModal for "Edit" mode */}
                        <SuratFormModal suratToEdit={surat}>
                          <button className="text-indigo-600 hover:text-indigo-900">Ubah</button>
                        </SuratFormModal>
                        <DeleteSuratButton suratId={surat.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}