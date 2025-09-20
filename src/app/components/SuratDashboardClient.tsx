// file: app/components/SuratDashboardClient.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Surat, Lampiran, Role, TipeDokumen } from '@prisma/client';

import SuratFormModal from './SuratFormModal';
import DeleteSuratButton from './DeleteSuratButton';
  import SuratDetailModal from './SuratDetailModal';

// --- Icons ---
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

// Constants
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
  const [isAnimating, setIsAnimating] = useState(false);

  // Pagination state
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  // Animate on changes (but exclude pagination changes)
  useEffect(() => {
    setIsAnimating(true);
    const id = setTimeout(() => setIsAnimating(false), 220);
    return () => clearTimeout(id);
  }, [activeArah, activeTipe, selectedTujuan, fromDate, toDate, searchQuery]); // Removed page, pageSize

  // Reset page when filters (excluding page/pageSize) change
  useEffect(() => {
    setPage(1);
  }, [activeArah, activeTipe, selectedTujuan, fromDate, toDate, searchQuery]);

  // Reset page when pageSize changes
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const tipeCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: suratList.length };
    TIPE_DOKUMEN_ORDER.forEach(
      (tipe) => (counts[tipe] = suratList.filter((s) => s.tipe_dokumen === tipe).length)
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
      const dateMatch = (!from || suratDate >= from) && (!to || suratDate <= to);
      return tipeMatch && arahMatch && searchMatch && tujuanMatch && dateMatch;
    });
  }, [suratList, activeTipe, activeArah, searchQuery, selectedTujuan, fromDate, toDate]);

  // Pagination calculations
  const totalItems = filteredSurat.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  if (safePage !== page) {
    // keep page in range
    setTimeout(() => setPage(safePage), 0);
  }
  const currentPageSurat = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredSurat.slice(start, start + pageSize);
  }, [filteredSurat, safePage, pageSize]);

  const firstItemIndex = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const lastItemIndex = totalItems === 0 ? 0 : Math.min(safePage * pageSize, totalItems);

  const handleTujuanChange = (tujuan: string) =>
    setSelectedTujuan((prev) =>
      prev.includes(tujuan) ? prev.filter((t) => t !== tujuan) : [...prev, tujuan]
    );

  const formatEnumText = (text: string) =>
    text.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const thStyle =
    'px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider backdrop-blur-sm align-middle';
  const tdStyle =
    'px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-gray-300 whitespace-normal break-words align-middle';

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Search Bar - Minimalist Design */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Cari perihal atau nomor surat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Filter Area - Redesigned */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col gap-5">
          {/* Filter Groups */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Tujuan Disposisi Filter */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Filter Tujuan Disposisi:
              </h3>
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-1.5 pl-1">
                {TUJUAN_DISPOSISI.map((tujuan) => (
                  <label
                    key={tujuan}
                    className="flex items-center space-x-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTujuan.includes(tujuan)}
                      onChange={() => handleTujuanChange(tujuan)}
                      className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 bg-gray-100 dark:bg-gray-700 transition"
                    />
                    <span className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
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
            </div>
            
            {/* Date Range Filter */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Rentang Tanggal:
              </h3>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Dari:</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="px-2.5 py-1.5 border rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sampai:</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-2.5 py-1.5 border rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFromDate('');
                    setToDate('');
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Type Filter - Separate Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg px-5 py-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center flex-wrap gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Tipe Dokumen:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTipe('ALL')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTipe === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Semua ({tipeCounts.ALL})
              </button>
              {TIPE_DOKUMEN_ORDER.map((tipe) => (
                <button
                  key={tipe}
                  onClick={() => setActiveTipe(tipe)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    activeTipe === tipe
                      ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {formatEnumText(tipe)} ({tipeCounts[tipe]})
                </button>
              ))}
            </div>
          </div>
          {role === 'ADMIN' && (
            <SuratFormModal>
              <button
                type="button"
                className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all whitespace-nowrap flex items-center gap-1.5 text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah Surat
              </button>
            </SuratFormModal>
          )}
        </div>
      </div>

      {/* Tabs (Surat Masuk / Keluar) - Highlighted Design */}
      <div className="flex bg-gray-50 dark:bg-gray-800/50 p-1 rounded-lg">
        <button
          onClick={() => setActiveArah('MASUK')}
          className={`flex-1 py-2.5 px-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-md ${
            activeArah === 'MASUK'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-indigo-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-700/60'
          }`}
        >
          <span>Surat Masuk</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            activeArah === 'MASUK'
              ? 'bg-white/20 text-white font-semibold'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          }`}>
            {tabCounts.MASUK}
          </span>
        </button>
        
        <button
          onClick={() => setActiveArah('KELUAR')}
          className={`flex-1 py-2.5 px-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-md ${
            activeArah === 'KELUAR'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-700/60'
          }`}
        >
          <span>Surat Keluar</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            activeArah === 'KELUAR'
              ? 'bg-white/20 text-white font-semibold'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          }`}>
            {tabCounts.KELUAR}
          </span>
        </button>
      </div>

      {/* Table Section */}
      <div
        className={`flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-out will-change-transform transform-gpu ${
          isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        }`}
      >
        {/* Scrollable Container */}
        <div className="overflow-auto max-h-[60vh] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <table className="min-w-full leading-normal">
            <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
              <tr>
                <th className={`${thStyle} w-12 text-center`}>No.</th>
                <th className={`${thStyle} min-w-[200px]`}>Perihal</th>
                <th className={`${thStyle} min-w-[120px]`}>Dari</th>
                <th className={`${thStyle} min-w-[120px]`}>Kepada</th>
                <th className={`${thStyle} min-w-[120px] whitespace-nowrap`}>Diterima</th>
                <th className={`${thStyle} min-w-[160px]`}>Tujuan Disposisi</th>
                <th className={`${thStyle} min-w-[180px]`}>Isi Disposisi</th>
                <th className={`${thStyle} w-28 text-center`}>Aksi</th>
              </tr>
            </thead>
            <tbody
              className={`transition-opacity duration-300 ease-out ${
                isAnimating ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {currentPageSurat.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Tidak ada data yang cocok dengan filter.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                currentPageSurat.map((surat, index) => (
                  <SuratDetailModal surat={surat} key={surat.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                      <td className={`${tdStyle} w-12 text-center text-gray-500 dark:text-gray-400 align-middle`}>
                        {firstItemIndex + index}
                      </td>
                      <td className={`${tdStyle} min-w-[200px] align-middle`}>
                        <p className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 break-words transition-colors">
                          {surat.perihal}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 break-words mt-0.5">
                          {surat.nomor_surat}
                        </p>
                      </td>
                      <td className={`${tdStyle} min-w-[120px] align-middle`}>{surat.asal_surat}</td>
                      <td className={`${tdStyle} min-w-[120px] align-middle`}>{surat.tujuan_surat}</td>
                      <td className={`${tdStyle} min-w-[120px] text-xs align-middle`}>
                        <div className="flex flex-col">
                          <span className="whitespace-nowrap">
                            {new Date(surat.tanggal_diterima_dibuat).toLocaleDateString('id-ID', {
                              dateStyle: 'short',
                            })}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            pukul {new Date(surat.tanggal_diterima_dibuat).toLocaleTimeString('id-ID', {
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className={`${tdStyle} min-w-[160px] align-middle`}>
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
                      <td className={`${tdStyle} min-w-[180px] align-middle`}>
                        <p className="truncate whitespace-normal break-words dark:text-gray-300">
                          {surat.isi_disposisi}
                        </p>
                      </td>
                      <td className={`${tdStyle} w-28 text-center align-middle`}>
                        <div className="flex items-center justify-center space-x-3">
                          {surat.lampiran[0] && (
                            <a
                              href={surat.lampiran[0].path_file}
                              download
                              title="Download Scan"
                              className="p-1.5 rounded-full text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-gray-600 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DownloadIcon />
                            </a>
                          )}
                          {role === 'ADMIN' && (
                            <>
                              {/* Wrap SuratFormModal in a div that stops propagation */}
                              <div onClick={(e) => e.stopPropagation()}>
                                <SuratFormModal suratToEdit={surat}>
                                  <button
                                    title="Ubah"
                                    className="p-1.5 rounded-full text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-gray-600 transition-colors"
                                    type="button"
                                  >
                                    <EditIcon />
                                  </button>
                                </SuratFormModal>
                              </div>
                              
                              {/* Wrap DeleteSuratButton in a div that stops propagation */}
                              <div onClick={(e) => e.stopPropagation()}>
                                <DeleteSuratButton suratId={surat.id}>
                                  <button
                                    title="Hapus"
                                    type="button"
                                    className="p-1.5 rounded-full text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-600 transition-colors"
                                  >
                                    <DeleteIcon />
                                  </button>
                                </DeleteSuratButton>
                              </div>
                            </>
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
        
        {/* Pagination - Redesigned */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-gray-200 dark:border-gray-700 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">Tampilkan:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2.5 py-1.5 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {[10, 20, 30, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} / halaman
                  </option>
                ))}
              </select>
            </div>
            <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {firstItemIndex}-{lastItemIndex} dari {totalItems} item
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(1)}
              disabled={safePage === 1}
              className={`w-9 h-9 flex items-center justify-center rounded border text-sm ${
                safePage === 1
                  ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600'
                  : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
              }`}
              aria-label="First Page"
            >
              «
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className={`px-3 h-9 rounded border text-sm flex items-center ${
                safePage === 1
                  ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600'
                  : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </button>
            <span className="px-4 h-9 inline-flex items-center justify-center text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className={`px-3 h-9 rounded border text-sm flex items-center ${
                safePage === totalPages
                  ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600'
                  : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
              }`}
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={safePage === totalPages}
              className={`w-9 h-9 flex items-center justify-center rounded border text-sm ${
                safePage === totalPages
                  ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600'
                  : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
              }`}
              aria-label="Last Page"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
