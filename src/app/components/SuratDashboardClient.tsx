// file: app/components/SuratDashboardClient.tsx
'use client';

import { useState, useMemo, useEffect, ReactNode } from 'react';
import { Surat, Lampiran, Role, TipeDokumen } from '@prisma/client';

// Impor semua komponen anak
import SuratFormModal from './SuratFormModal';
import DeleteSuratButton from './DeleteSuratButton';
import SuratDetailModal from './SuratDetailModal';

// --- Komponen Ikon SVG Sederhana ---
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
);
const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.576 0h12.576" />
  </svg>
);
// --- Akhir Komponen Ikon ---

// Konstanta untuk membangun elemen UI
const TIPE_DOKUMEN_ORDER: TipeDokumen[] = ['NOTA_DINAS', 'SURAT_BIASA', 'SPRIN', 'TELEGRAM'];
const TUJUAN_DISPOSISI = ['KASUBBID_TEKKOM', 'KASUBBID_TEKINFO', 'KASUBBAG_RENMIN', 'KAUR_KEU'];

type Props = {
  suratId: string;
  suratList: (Surat & { lampiran: Lampiran[] })[];
  role?: Role | null;
};

export default function SuratDashboardClient({ suratId, suratList, role }: Props) {
  const [activeTipe, setActiveTipe] = useState('ALL');
  const [activeArah, setActiveArah] = useState<'MASUK' | 'KELUAR'>('MASUK');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTujuan, setSelectedTujuan] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  // small smooth transition state when tabs change
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // trigger short animation on tab change
    setIsAnimating(true);
    const id = setTimeout(() => setIsAnimating(false), 220);
    return () => clearTimeout(id);
  }, [activeArah]);

  const tipeCounts = useMemo(() => {
    const counts: { [key: string]: number } = { ALL: suratList.length };
    TIPE_DOKUMEN_ORDER.forEach(
      (tipe) =>
        (counts[tipe] = suratList.filter((s) => s.tipe_dokumen === tipe).length)
    );
    return counts;
  }, [suratList]);

  const tabCounts = useMemo(() => {
    const listFilteredByType = suratList.filter(
      (surat) => activeTipe === 'ALL' || surat.tipe_dokumen === activeTipe
    );
    return {
      MASUK: listFilteredByType.filter((s) => s.arah_surat === 'MASUK').length,
      KELUAR: listFilteredByType.filter((s) => s.arah_surat === 'KELUAR').length,
    };
  }, [suratList, activeTipe]);

  const filteredSurat = useMemo(() => {
    return suratList.filter((surat) => {
      const tipeMatch = activeTipe === 'ALL' || surat.tipe_dokumen === activeTipe;
      const arahMatch = surat.arah_surat === activeArah;
      const searchMatch =
        searchQuery === '' ||
        surat.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surat.nomor_surat.toLowerCase().includes(searchQuery.toLowerCase());
      const tujuanMatch =
        selectedTujuan.length === 0 ||
        selectedTujuan.some((tujuan) => surat.tujuan_disposisi.includes(tujuan));
      // Date range check
      const suratDate = new Date(surat.tanggal_diterima_dibuat);
      let from: Date | null = null;
      let to: Date | null = null;
      if (fromDate) {
        from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
      }
      if (toDate) {
        to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
      }
      const dateMatch =
        (!from || suratDate >= from) && (!to || suratDate <= to);
      return tipeMatch && arahMatch && searchMatch && tujuanMatch && dateMatch;
    });
  }, [suratList, activeTipe, activeArah, searchQuery, selectedTujuan, fromDate, toDate]);

  const handleTujuanChange = (tujuan: string) =>
    setSelectedTujuan((prev) =>
      prev.includes(tujuan)
        ? prev.filter((t) => t !== tujuan)
        : [...prev, tujuan]
    );

  const formatEnumText = (text: string) =>
    text.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  // Style tabel
  const thStyle =
    'px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider';
  const tdStyle =
    'px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-gray-300 whitespace-normal break-words';

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-1/4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Tipe Dokumen
        </h2>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setActiveTipe('ALL')}
              className={`w-full flex justify-between items-center text-left px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTipe === 'ALL'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <span>Semua Tipe</span>
              <span>({tipeCounts.ALL})</span>
            </button>
          </li>
          {TIPE_DOKUMEN_ORDER.map((tipe) => (
            <li key={tipe}>
              <button
                onClick={() => setActiveTipe(tipe)}
                className={`w-full flex justify-between items-center text-left px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTipe === tipe
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span>{formatEnumText(tipe)}</span>
                <span>({tipeCounts[tipe]})</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filter Tujuan Disposisi:
                </label>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                  {TUJUAN_DISPOSISI.map((tujuan) => (
                    <label
                      key={tujuan}
                      className="flex items-center space-x-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTujuan.includes(tujuan)}
                        onChange={() => handleTujuanChange(tujuan)}
                        className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-700"
                      />
                      <span className="dark:text-gray-300">
                        {formatEnumText(
                          tujuan
                            .replace('KASUBBID_', '')
                            .replace('KASUBBAG_', '')
                            .replace('KAUR_', '')
                        )}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Date range filter */}
                <div className="mt-3 flex items-center gap-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Dari:</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="px-2 py-1 border rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                  <label className="text-sm text-gray-700 dark:text-gray-300">Sampai:</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-2 py-1 border rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFromDate('');
                      setToDate('');
                    }}
                    className="ml-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
            {role === 'ADMIN' && (
              <div className="flex-shrink-0 pt-1">
                <SuratFormModal>
                  <button
                    type="button"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition"
                  >
                    Tambah Surat
                  </button>
                </SuratFormModal>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 items-end mb-0">
          <button
            onClick={() => setActiveArah('MASUK')}
            className={`px-6 py-3 text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
              activeArah === 'MASUK'
                ? 'bg-white dark:bg-gray-800 rounded-t-lg -mb-px z-10 shadow text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700 border-b-0'
                : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-md'
            }`}
          >
            <span>Surat Masuk</span>
            <span className="bg-gray-200 dark:bg-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {tabCounts.MASUK}
            </span>
          </button>
          <button
            onClick={() => setActiveArah('KELUAR')}
            className={`px-6 py-3 text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
              activeArah === 'KELUAR'
                ? 'bg-white dark:bg-gray-800 rounded-t-lg -mb-px z-10 shadow text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700 border-b-0'
                : 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-md'
            }`}
          >
            <span>Surat Keluar</span>
            <span className="bg-gray-200 dark:bg-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {tabCounts.KELUAR}
            </span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow overflow-x-auto border border-gray-200 dark:border-gray-700 border-t-0">
           <table className="min-w-full leading-normal">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className={`${thStyle} w-12 text-center`}>No.</th>
                <th className={thStyle}>Perihal</th>
                <th className={thStyle}>Dari</th>
                <th className={thStyle}>Kepada</th>
                <th className={thStyle}>Diterima</th>
                <th className={thStyle}>Tujuan Disposisi</th>
                <th className={thStyle}>Isi Disposisi</th>
                <th className={`${thStyle} w-28 text-center`}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSurat.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-10 text-gray-500 dark:text-gray-400"
                  >
                    Tidak ada data yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredSurat.map((surat, index) => (
                  <tr
                    key={surat.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td
                      className={`${tdStyle} text-center text-gray-500 dark:text-gray-400`}
                    >
                      {index + 1}
                    </td>

                    {/* Perihal */}
                    <td className={`${tdStyle} max-w-sm`}>
                      <SuratDetailModal surat={surat}>
                        <div className="cursor-pointer">
                          <p className="font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 break-words">
                            {surat.perihal}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 break-words">
                            {surat.nomor_surat}
                          </p>
                        </div>
                      </SuratDetailModal>
                    </td>

                    <td className={tdStyle}>{surat.asal_surat}</td>
                    <td className={tdStyle}>{surat.tujuan_surat}</td>
                    <td className={`${tdStyle} text-xs`}>
                      {new Date(
                        surat.tanggal_diterima_dibuat
                      ).toLocaleString('id-ID', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>

                    {/* Tujuan Disposisi */}
                    <td className={`${tdStyle} max-w-xs`}>
                      <div className="flex flex-wrap gap-1">
                        {surat.tujuan_disposisi.map((tujuan) => (
                          <span
                            key={tujuan}
                            className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full"
                          >
                            {formatEnumText(
                              tujuan
                                .replace('KASUBBID_', '')
                                .replace('KASUBBAG_', '')
                                .replace('KAUR_', '')
                            )}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Isi Disposisi */}
                    <td className={`${tdStyle} max-w-md`}>
                      <p className="truncate whitespace-normal break-words dark:text-gray-300">
                        {surat.isi_disposisi}
                      </p>
                    </td>

                    {/* Aksi */}
                    <td className={`${tdStyle} text-center`}>
                      <div className="flex items-center justify-center space-x-3">
                        {surat.lampiran[0] && (
                          <a
                            href={surat.lampiran[0].path_file}
                            download
                            title="Download Scan"
                            className="p-1 rounded-full text-green-600 hover:bg-gray-100 dark:text-green-400 dark:hover:bg-gray-600"
                          >
                            <DownloadIcon />
                          </a>
                        )}
                        {role === 'ADMIN' && (
                          <>
                            <SuratFormModal suratToEdit={surat}>
                              <button
                                title="Ubah"
                                className="p-1 rounded-full text-indigo-600 hover:bg-gray-100 dark:text-indigo-400 dark:hover:bg-gray-600"
                                type="button"
                              >
                                <EditIcon />
                              </button>
                            </SuratFormModal>

                            {/* Render delete icon as child of DeleteSuratButton so it shows up */}
                            <DeleteSuratButton suratId={surat.id}>
                              <button
                                title="Hapus"
                                type="button"
                                className="p-1 rounded-full text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-600"
                              >
                                <DeleteIcon />
                              </button>
                            </DeleteSuratButton>
                          </>
                        )}
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
