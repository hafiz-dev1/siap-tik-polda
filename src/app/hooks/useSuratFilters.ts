import { useState, useMemo, useEffect, useCallback } from 'react';
import { Surat, Lampiran, TipeDokumen } from '@prisma/client';

const TIPE_DOKUMEN_ORDER: TipeDokumen[] = ['NOTA_DINAS', 'SURAT_BIASA', 'SPRIN', 'TELEGRAM'];

type SuratWithLampiran = Surat & { lampiran: Lampiran[] };

export function useSuratFilters(
  suratList: SuratWithLampiran[],
  formatEnumText: (text: string) => string
) {
  const [activeTipe, setActiveTipe] = useState('ALL');
  const [activeArah, setActiveArah] = useState<'MASUK' | 'KELUAR'>('MASUK');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Memoized search function
  const searchInSurat = useCallback(
    (surat: SuratWithLampiran, query: string) => {
      if (!query.trim()) return true;

      const lowerQuery = query.toLowerCase();

      // Helper function to safely check string fields
      const safeStringMatch = (field: string | null | undefined) =>
        field ? field.toLowerCase().includes(lowerQuery) : false;

      // Check basic string fields
      if (
        safeStringMatch(surat.perihal) ||
        safeStringMatch(surat.nomor_surat) ||
        safeStringMatch(surat.asal_surat) ||
        safeStringMatch(surat.tujuan_surat) ||
        safeStringMatch(surat.isi_disposisi) ||
        safeStringMatch(surat.nomor_agenda)
      ) {
        return true;
      }

      // Check formatted tipe dokumen
      if (
        surat.tipe_dokumen &&
        formatEnumText(surat.tipe_dokumen).toLowerCase().includes(lowerQuery)
      ) {
        return true;
      }

      // Check tujuan disposisi array
      if (Array.isArray(surat.tujuan_disposisi) && surat.tujuan_disposisi.length > 0) {
        const disposisiMatch = surat.tujuan_disposisi.some((tujuan) => {
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
        const lampiranMatch = surat.lampiran.some(
          (lampiran) =>
            lampiran && lampiran.nama_file && lampiran.nama_file.toLowerCase().includes(lowerQuery)
        );
        if (lampiranMatch) return true;
      }

      return false;
    },
    [formatEnumText]
  );

  // Memoized date filter function
  const isDateInRange = useCallback(
    (suratDateInput: string | Date, fromDate: string, toDate: string) => {
      if (!fromDate && !toDate) return true;

      const surat = suratDateInput instanceof Date ? suratDateInput : new Date(suratDateInput);
      if (isNaN(surat.getTime())) return false;

      if (fromDate) {
        const from = new Date(fromDate);
        if (!isNaN(from.getTime())) {
          from.setHours(0, 0, 0, 0);
          if (surat < from) return false;
        }
      }

      if (toDate) {
        const to = new Date(toDate);
        if (!isNaN(to.getTime())) {
          to.setHours(23, 59, 59, 999);
          if (surat > to) return false;
        }
      }

      return true;
    },
    []
  );

  // Memoized counts
  const tipeCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: suratList.length };

    TIPE_DOKUMEN_ORDER.forEach((tipe) => {
      counts[tipe] = 0;
    });

    suratList.forEach((surat) => {
      if (TIPE_DOKUMEN_ORDER.includes(surat.tipe_dokumen)) {
        counts[surat.tipe_dokumen]++;
      }
    });

    return counts;
  }, [suratList]);

  const tabCounts = useMemo(() => {
    let masukCount = 0;
    let keluarCount = 0;

    suratList.forEach((surat) => {
      if (activeTipe === 'ALL' || surat.tipe_dokumen === activeTipe) {
        if (surat.arah_surat === 'MASUK') masukCount++;
        else if (surat.arah_surat === 'KELUAR') keluarCount++;
      }
    });

    return { MASUK: masukCount, KELUAR: keluarCount };
  }, [suratList, activeTipe]);

  // Memoized filtered data
  const filteredSurat = useMemo(() => {
    return suratList.filter((surat) => {
      // Type and direction filters
      const tipeMatch = activeTipe === 'ALL' || surat.tipe_dokumen === activeTipe;
      const arahMatch = surat.arah_surat === activeArah;

      if (!tipeMatch || !arahMatch) return false;

      // Search filter
      const searchMatch = searchInSurat(surat, debouncedSearchQuery);
      if (!searchMatch) return false;

      // Date filter
      const dateMatch = isDateInRange(surat.tanggal_diterima_dibuat, fromDate, toDate);

      return dateMatch;
    });
  }, [suratList, activeTipe, activeArah, debouncedSearchQuery, fromDate, toDate, searchInSurat, isDateInRange]);

  const resetFilters = useCallback(() => {
    setFromDate('');
    setToDate('');
    setSearchQuery('');
  }, []);

  return {
    // State
    activeTipe,
    activeArah,
    searchQuery,
    fromDate,
    toDate,
    
    // Derived data
    filteredSurat,
    tipeCounts,
    tabCounts,
    
    // Actions
    setActiveTipe,
    setActiveArah,
    setSearchQuery,
    setFromDate,
    setToDate,
    resetFilters,
  };
}