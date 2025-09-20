// file: app/components/SuratDashboardClient.tsx
'use client';

import { useState, useMemo, useEffect, Fragment } from 'react';
import { Surat, Lampiran, Role, TipeDokumen } from '@prisma/client';
import * as XLSX from 'xlsx';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';

import SuratFormModal from './SuratFormModal';
import DeleteSuratButton from './DeleteSuratButton';

// --- Icons ---
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21h-15A1.5 1.5 0 0 1 3 19.5v-15A1.5 1.5 0 0 1 4.5 3h9.379a1.5 1.5 0 0 1 1.06.44l4.621 4.621a1.5 1.5 0 0 1 .44 1.06V19.5A1.5 1.5 0 0 1 19.5 21zM15 3.75V7.5a.75.75 0 0 0 .75.75h3.75" />
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
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState<(Surat & { lampiran: Lampiran[] }) | null>(null);

  // Pagination state
  const [pageSize, setPageSize] = useState<number>(25);
  const [page, setPage] = useState<number>(1);

  // Animate on changes (but exclude pagination changes)
  useEffect(() => {
    setIsAnimating(true);
    const id = setTimeout(() => setIsAnimating(false), 220);
    return () => clearTimeout(id);
  }, [activeArah, activeTipe, fromDate, toDate, searchQuery]); // Removed selectedTujuan

  // Reset page when filters (excluding page/pageSize) change
  useEffect(() => {
    setPage(1);
  }, [activeArah, activeTipe, fromDate, toDate, searchQuery]);

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

  // Helper function to format enum text - moved before filteredSurat to avoid temporal dead zone
  const formatEnumText = (text: string) =>
    text.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  const filteredSurat = useMemo(() => {
    return suratList.filter((surat) => {
      // Type and direction filters
      const tipeMatch = activeTipe === 'ALL' || surat.tipe_dokumen === activeTipe;
      const arahMatch = surat.arah_surat === activeArah;
      
      // Search filter with null safety and trimming
      const trimmedQuery = searchQuery.trim();
      const searchMatch = trimmedQuery === '' || (() => {
        const lowerQuery = trimmedQuery.toLowerCase();
        
        // Helper function to safely check string fields
        const safeStringMatch = (field: string | null | undefined) => 
          field ? field.toLowerCase().includes(lowerQuery) : false;
        
        // Check basic string fields
        if (safeStringMatch(surat.perihal) ||
            safeStringMatch(surat.nomor_surat) ||
            safeStringMatch(surat.asal_surat) ||
            safeStringMatch(surat.tujuan_surat) ||
            safeStringMatch(surat.isi_disposisi) ||
            safeStringMatch(surat.nomor_agenda)) {
          return true;
        }
        
        // Check formatted tipe dokumen
        if (surat.tipe_dokumen && 
            formatEnumText(surat.tipe_dokumen).toLowerCase().includes(lowerQuery)) {
          return true;
        }
        
        // Check tujuan disposisi array
        if (Array.isArray(surat.tujuan_disposisi) && surat.tujuan_disposisi.length > 0) {
          const disposisiMatch = surat.tujuan_disposisi.some(tujuan => {
            if (!tujuan) return false;
            const formattedTujuan = formatEnumText(
              tujuan.replace('KASUBBID_', '').replace('KASUBBAG_', '').replace('KAUR_', '')
            );
            return formattedTujuan.toLowerCase().includes(lowerQuery);
          });
          if (disposisiMatch) return true;
        }
        
        // Check lampiran files
        if (Array.isArray(surat.lampiran) && surat.lampiran.length > 0) {
          const lampiranMatch = surat.lampiran.some(lampiran => 
            lampiran && lampiran.nama_file && 
            lampiran.nama_file.toLowerCase().includes(lowerQuery)
          );
          if (lampiranMatch) return true;
        }
        
        return false;
      })();
      
      // Date filter with validation
      let dateMatch = true;
      if (fromDate || toDate) {
        const suratDate = new Date(surat.tanggal_diterima_dibuat);
        
        // Validate surat date
        if (isNaN(suratDate.getTime())) {
          dateMatch = false;
        } else {
          if (fromDate) {
            const from = new Date(fromDate);
            if (!isNaN(from.getTime())) {
              from.setHours(0, 0, 0, 0);
              if (suratDate < from) dateMatch = false;
            }
          }
          
          if (toDate && dateMatch) {
            const to = new Date(toDate);
            if (!isNaN(to.getTime())) {
              to.setHours(23, 59, 59, 999);
              if (suratDate > to) dateMatch = false;
            }
          }
        }
      }
      
      return tipeMatch && arahMatch && searchMatch && dateMatch;
    });
  }, [suratList, activeTipe, activeArah, searchQuery, fromDate, toDate]);

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

  // Modal functions
  const openModal = (surat: Surat & { lampiran: Lampiran[] }) => {
    setSelectedSurat(surat);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSurat(null);
  };

  // Excel export function
  const exportToExcel = () => {
    // Separate data by direction
    const suratMasuk = suratList.filter(surat => surat.arah_surat === 'MASUK');
    const suratKeluar = suratList.filter(surat => surat.arah_surat === 'KELUAR');

    // Helper function to prepare data for Excel
    const prepareDataForExcel = (data: (Surat & { lampiran: Lampiran[] })[]) => {
      return data.map((surat, index) => ({
        'No': index + 1,
        'Nomor Agenda': surat.nomor_agenda,
        'Nomor Surat': surat.nomor_surat,
        'Tanggal Surat': new Date(surat.tanggal_surat).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric'
        }),
        'Tanggal Diterima/Dibuat': new Date(surat.tanggal_diterima_dibuat).toLocaleString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        'Asal Surat': surat.asal_surat,
        'Tujuan Surat': surat.tujuan_surat,
        'Perihal': surat.perihal,
        'Tipe Dokumen': formatEnumText(surat.tipe_dokumen),
        'Tujuan Disposisi': surat.tujuan_disposisi.map(tujuan => 
          formatEnumText(
            tujuan
              .replace('KASUBBID_', '')
              .replace('KASUBBAG_', '')
              .replace('KAUR_', '')
          )
        ).join(', '),
        'Isi Disposisi': surat.isi_disposisi,
        'Lampiran': surat.lampiran[0]?.nama_file || 'Tidak ada lampiran'
      }));
    };

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Create Surat Masuk sheet
    const suratMasukData = prepareDataForExcel(suratMasuk);
    const wsMasuk = XLSX.utils.json_to_sheet(suratMasukData);
    XLSX.utils.book_append_sheet(workbook, wsMasuk, 'Surat Masuk');

    // Create Surat Keluar sheet  
    const suratKeluarData = prepareDataForExcel(suratKeluar);
    const wsKeluar = XLSX.utils.json_to_sheet(suratKeluarData);
    XLSX.utils.book_append_sheet(workbook, wsKeluar, 'Surat Keluar');

    // Generate filename with current date and time
    const now = new Date();
    const currentDate = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
    const currentTime = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/:/g, '-');
    const filename = `Data Surat Disposisi_${currentDate}_${currentTime}.xlsx`;

    // Save file
    XLSX.writeFile(workbook, filename);
  };

  const thStyle =
    'px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider backdrop-blur-sm align-middle';
  const tdStyle =
    'px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-gray-300 whitespace-normal break-words align-middle';

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">

      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari surat (perihal, nomor, asal, tujuan, disposisi, agenda, lampiran...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-300 dark:focus:border-gray-600 transition-all text-sm placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 cursor-pointer"
              title="Tanggal Mulai"
            />
            <span className="text-gray-400 text-xs">—</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 cursor-pointer"
              title="Tanggal Akhir"
            />
          </div>

          {/* Reset Button */}
          {(fromDate || toDate || searchQuery) && (
            <button
              onClick={() => {
                setFromDate('');
                setToDate('');
                setSearchQuery('');
              }}
              className="px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Reset Filter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          )}
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
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
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
                  className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
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
          <div className="flex items-center gap-3">
            {/* Download Excel Button */}
            <button
              onClick={exportToExcel}
              type="button"
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all whitespace-nowrap flex items-center gap-1.5 text-sm cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Excel
            </button>
            
            {/* Tambah Surat Button - Only for Admin */}
            {role === 'ADMIN' && (
              <SuratFormModal>
                <button
                  type="button"
                  className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all whitespace-nowrap flex items-center gap-1.5 text-sm cursor-pointer"
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
      </div>

      {/* Tabs (Surat Masuk / Keluar) - Highlighted Design */}
      <div className="flex bg-gray-50 dark:bg-gray-800/50 p-1 rounded-lg">
        <button
          onClick={() => setActiveArah('MASUK')}
          className={`flex-1 py-2.5 px-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-md cursor-pointer ${
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
          className={`flex-1 py-2.5 px-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-md cursor-pointer ${
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
        className={`flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-out will-change-transform transform-gpu overflow-hidden ${
          isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        }`}
      >
        {/* Scrollable Container */}
        <div className="overflow-auto max-h-[60vh] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <table className="min-w-full leading-normal">
            <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
              <tr>
                <th className={`${thStyle} w-12 text-center rounded-tl-lg`}>No.</th>
                <th className={`${thStyle} min-w-[200px]`}>Perihal</th>
                <th className={`${thStyle} min-w-[120px]`}>Dari</th>
                <th className={`${thStyle} min-w-[120px]`}>Kepada</th>
                <th className={`${thStyle} min-w-[120px] whitespace-nowrap`}>Diterima</th>
                <th className={`${thStyle} min-w-[160px]`}>Tujuan Disposisi</th>
                <th className={`${thStyle} min-w-[180px]`}>Isi Disposisi</th>
                <th className={`${thStyle} w-28 text-center rounded-tr-lg`}>Aksi</th>
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
                  <tr 
                    key={surat.id}
                    onClick={() => openModal(surat)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
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
                          {(() => {
                          const d = new Date(surat.tanggal_diterima_dibuat);
                          const day = String(d.getDate()).padStart(2, '0');
                          const month = String(d.getMonth() + 1).padStart(2, '0');
                          const year = String(d.getFullYear()).slice(-2);
                          return `${day} / ${month} / ${year}`;
                          })()}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {new Date(surat.tanggal_diterima_dibuat)
                          .toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })} WIB
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(surat.lampiran[0].path_file, '_blank');
                            }}
                            title="Lihat Dokumen"
                            className="p-1.5 rounded-full text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                          >
                            <DownloadIcon />
                          </button>
                        )}
                        {role === 'ADMIN' && (
                          <>
                            {/* Wrap SuratFormModal in a div that stops propagation */}
                            <div onClick={(e) => e.stopPropagation()}>
                              <SuratFormModal suratToEdit={surat}>
                                <button
                                  title="Ubah"
                                  className="p-1.5 rounded-full text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-gray-600 transition-colors cursor-pointer"
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
                                  className="p-1.5 rounded-full text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-600 transition-colors cursor-pointer"
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
                className="px-2.5 py-1.5 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
              >
                {[25, 50, 100].map((n) => (
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
                  : 'cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
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
                  : 'cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
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
                  : 'cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
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
                  : 'cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
              }`}
              aria-label="Last Page"
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* Surat Detail Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 focus:outline-none" onClose={closeModal}>
          <div className="fixed inset-0 bg-black/30 dark:bg-black/50" aria-hidden="true" />
          
          <div className="fixed inset-0 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
                  {selectedSurat && (
                    <>
                      <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                        Detail Surat {selectedSurat.arah_surat === 'MASUK' ? 'Masuk' : 'Keluar'}
                      </DialogTitle>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {/* Nomor Agenda */}
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Nomor Agenda:</span>
                          <p className="text-gray-900 dark:text-gray-100">{selectedSurat.nomor_agenda}</p>
                        </div>

                        {/* Nomor Surat */}
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Nomor Surat:</span>
                          <p className="text-gray-900 dark:text-gray-100">{selectedSurat.nomor_surat}</p>
                        </div>

                        {/* Tanggal Surat */}
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Tanggal Surat:</span>
                          <p className="text-gray-900 dark:text-gray-100">
                            {new Date(selectedSurat.tanggal_surat).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>

                        {/* Tanggal Diterima/Dibuat */}
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            Tanggal {selectedSurat.arah_surat === 'MASUK' ? 'Diterima' : 'Dibuat'}:
                          </span>
                          <p className="text-gray-900 dark:text-gray-100">
                            {new Date(selectedSurat.tanggal_diterima_dibuat).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })} pukul {new Date(selectedSurat.tanggal_diterima_dibuat).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>

                        {/* Asal Surat */}
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {selectedSurat.arah_surat === 'MASUK' ? 'Asal Surat' : 'Dari'}:
                          </span>
                          <p className="text-gray-900 dark:text-gray-100">{selectedSurat.asal_surat}</p>
                        </div>

                        {/* Tujuan Surat */}
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">
                            {selectedSurat.arah_surat === 'MASUK' ? 'Kepada' : 'Tujuan Surat'}:
                          </span>
                          <p className="text-gray-900 dark:text-gray-100">{selectedSurat.tujuan_surat}</p>
                        </div>

                        {/* Tipe Dokumen */}
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Tipe Dokumen:</span>
                          <p className="text-gray-900 dark:text-gray-100">{formatEnumText(selectedSurat.tipe_dokumen)}</p>
                        </div>

                        {/* Tujuan Disposisi */}
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Tujuan Disposisi:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedSurat.tujuan_disposisi.map((tujuan) => (
                              <span
                                key={tujuan}
                                className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full"
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
                        </div>
                      </div>

                      {/* Perihal */}
                      <div className="mt-4">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Perihal:</span>
                        <p className="text-gray-900 dark:text-gray-100 mt-1">{selectedSurat.perihal}</p>
                      </div>

                      {/* Isi Disposisi */}
                      <div className="mt-4">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Isi Disposisi:</span>
                        <p className="text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-wrap">{selectedSurat.isi_disposisi}</p>
                      </div>

                      {/* Lampiran */}
                      {selectedSurat.lampiran.length > 0 && (
                        <div className="mt-4">
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Lampiran:</span>
                          <div className="mt-2 space-y-2">
                            {selectedSurat.lampiran.map((lampiran) => (
                              <div
                                key={lampiran.id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                              >
                                <div className="flex items-center space-x-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-sm text-gray-900 dark:text-gray-100">{lampiran.nama_file}</span>
                                </div>
                                <button
                                  onClick={() => window.open(lampiran.path_file, '_blank')}
                                  className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                                >
                                  Buka
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          onClick={closeModal}
                          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          Tutup
                        </button>
                      </div>
                    </>
                  )}
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
