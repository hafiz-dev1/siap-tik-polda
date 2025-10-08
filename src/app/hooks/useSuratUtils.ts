import { useCallback, useMemo } from 'react';
import { Surat, Lampiran } from '@prisma/client';
import * as XLSX from 'xlsx';

type SuratWithLampiran = Surat & { lampiran: Lampiran[] };

export function useSuratFormatters() {
  // Memoized helper function to format enum text
  const formatEnumText = useCallback(
    (text: string) => text.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    []
  );

  // Memoized tag color function
  const getTagColor = useCallback((target: string) => {
    const colorMap: Record<string, string> = {
      'KASUBBID_TEKKOM': 'bg-blue-25 dark:bg-blue-900/15 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30',
      'KASUBBID_TEKINFO': 'bg-emerald-25 dark:bg-emerald-900/15 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30',
      'KASUBBAG_RENMIN': 'bg-purple-25 dark:bg-purple-900/15 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/30',
      'KAUR_KEU': 'bg-rose-25 dark:bg-rose-900/15 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/30'
    };
    return colorMap[target] || 'bg-indigo-25 dark:bg-indigo-900/15 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/30';
  }, []);

  // Memoized date formatter
  const formatDate = useCallback((dateInput: string | Date) => {
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day} / ${month} / ${year}`;
  }, []);

  const formatTime = useCallback((dateInput: string | Date) => {
    const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) + ' WIB';
  }, []);

  // Memoized function to format disposition target with full name
  const formatDispositionTarget = useCallback((target: string) => {
    const targetMap: Record<string, string> = {
      'KASUBBID_TEKKOM': 'KASUBBID TEKKOM',
      'KASUBBID_TEKINFO': 'KASUBBID TEKINFO',
      'KASUBBAG_RENMIN': 'KASUBBAG RENMIN',
      'KAUR_KEU': 'KAUR KEU'
    };
    return targetMap[target] || formatEnumText(target);
  }, [formatEnumText]);

  return {
    formatEnumText,
    getTagColor,
    formatDate,
    formatTime,
    formatDispositionTarget,
  };
}

export function useExcelExport() {
  const { formatEnumText } = useSuratFormatters();
  
  const exportToExcel = useCallback((suratList: SuratWithLampiran[]) => {
    // Helper function to prepare data for Excel
    const prepareDataForExcel = (data: SuratWithLampiran[]) => {
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

    // Separate data by direction for better performance
    const suratMasuk: SuratWithLampiran[] = [];
    const suratKeluar: SuratWithLampiran[] = [];
    
    suratList.forEach(surat => {
      if (surat.arah_surat === 'MASUK') {
        suratMasuk.push(surat);
      } else {
        suratKeluar.push(surat);
      }
    });

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
  }, [formatEnumText]);

  return { exportToExcel };
}