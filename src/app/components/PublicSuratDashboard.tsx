// file: app/components/PublicSuratDashboard.tsx
'use client';

import { useState, useMemo } from 'react';
import { Surat, Lampiran } from '@prisma/client';
import SuratDetailModal from '../admin/components/SuratDetailModal'; // Re-using the detail modal from the admin section

// Define the type for the props, which includes the related Lampiran data
type SuratWithLampiran = Surat & { lampiran: Lampiran[] };
type Props = {
  suratList: SuratWithLampiran[];
};

// Constants for building the UI
const TIPE_DOKUMEN = ['NOTA_DINAS', 'SURAT_BIASA', 'SPRIN', 'TELEGRAM'];
const TUJUAN_DISPOSISI = ['KASUBBID_TEKKOM', 'KASUBBID_TEKINFO', 'KASUBBAG_RENMIN', 'KAUR_KEU'];

export default function PublicSuratDashboard({ suratList }: Props) {
  // All state and filtering logic is reused from the admin dashboard
  const [activeTipe, setActiveTipe] = useState('NOTA_DINAS');
  const [activeArah, setActiveArah] = useState<'MASUK' | 'KELUAR'>('MASUK');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTujuan, setSelectedTujuan] = useState<string[]>([]);

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

  const handleTujuanChange = (tujuan: string) => {
    setSelectedTujuan((prev) =>
      prev.includes(tujuan) ? prev.filter((t) => t !== tujuan) : [...prev, tujuan]
    );
  };
  
  const formatEnumText = (text: string) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left Column: Sidebar for Document Type Selection */}
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
        {/* Filter Bar (without the "Add New" button) */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <input
              type="text"
              placeholder="Cari perihal atau nomor surat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div>
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

        {/* Data Table (without the "Aksi" column for edit/delete) */}
        <div className="bg-white rounded-b-lg shadow overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Detail Surat & Disposisi
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                  Lampiran
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSurat.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center py-10 text-gray-500">
                    Tidak ada data surat yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredSurat.map((surat) => (
                  <SuratDetailModal key={surat.id} surat={surat}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <div className="flex flex-col">
                          <p className="text-gray-900 font-bold whitespace-no-wrap">{surat.perihal}</p>
                          <p className="text-gray-600 text-xs mt-1">
                            <span className="font-semibold">Dari:</span> {surat.asal_surat} | <span className="font-semibold">Ke:</span> {surat.tujuan_surat}
                          </p>
                          <p className="text-gray-600 text-xs">
                            <span className="font-semibold">Tgl Surat:</span> {new Date(surat.tanggal_surat).toLocaleDateString('id-ID')}
                          </p>
                          <p className="text-gray-800 text-xs mt-2 bg-gray-50 p-1 rounded border truncate">
                            <span className="font-semibold">Disposisi:</span> {surat.isi_disposisi}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        {surat.lampiran[0] ? (
                          <a
                            href={surat.lampiran[0].path_file}
                            download
                            onClick={(e) => e.stopPropagation()}
                            className="inline-block px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 no-underline"
                          >
                            Download Scan
                          </a>
                        ) : (
                          <span className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-200 rounded-full">
                            No File
                          </span>
                        )}
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