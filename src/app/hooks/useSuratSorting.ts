// file: app/hooks/useSuratSorting.ts
'use client';

import { useState, useMemo } from 'react';
import { Surat, Lampiran } from '@prisma/client';

type SuratWithLampiran = Surat & { lampiran: Lampiran[] };

export type SortField = 
  | 'none' 
  | 'index' 
  | 'perihal' 
  | 'dari' 
  | 'kepada' 
  | 'diterima' 
  | 'isi_disposisi';

export type SortOrder = 'asc' | 'desc';

interface UseSuratSortingReturn {
  sortField: SortField;
  sortOrder: SortOrder;
  sortedData: SuratWithLampiran[];
  handleSort: (field: SortField) => void;
  getSortIcon: (field: SortField) => '↑' | '↓' | '';
}

/**
 * Custom hook untuk mengelola sorting data surat
 * Hanya satu kolom yang bisa aktif sorting pada satu waktu
 * Default: urutkan berdasarkan surat terbaru (createdAt desc)
 */
export function useSuratSorting(data: SuratWithLampiran[]): UseSuratSortingReturn {
  const [sortField, setSortField] = useState<SortField>('index');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  /**
   * Handler untuk mengubah field dan order sorting
   * Jika klik field yang sama, toggle order (asc <-> desc)
   * Jika klik field berbeda, set field baru dengan order 'asc'
   */
  const handleSort = (field: SortField) => {
    if (field === 'none') {
      setSortField('none');
      setSortOrder('asc');
      return;
    }

    if (field === sortField) {
      // Toggle order jika field sama
      setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set field baru dengan order ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };

  /**
   * Mendapatkan icon untuk ditampilkan di header
   * Hanya field yang aktif yang akan menampilkan icon
   */
  const getSortIcon = (field: SortField): '↑' | '↓' | '' => {
    if (field === 'none' || field !== sortField) return '';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  /**
   * Memoized sorted data
   * Hanya akan re-compute ketika data, sortField, atau sortOrder berubah
   */
  const sortedData = useMemo(() => {
    if (sortField === 'none') return data;

    const sorted = [...data].sort((a, b) => {
      let compareValue = 0;

      switch (sortField) {
        case 'index':
          // Untuk index, kita sort berdasarkan createdAt (atau ID jika ingin)
          compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;

        case 'perihal':
          compareValue = a.perihal.localeCompare(b.perihal, 'id', { sensitivity: 'base' });
          break;

        case 'dari':
          compareValue = a.asal_surat.localeCompare(b.asal_surat, 'id', { sensitivity: 'base' });
          break;

        case 'kepada':
          compareValue = a.tujuan_surat.localeCompare(b.tujuan_surat, 'id', { sensitivity: 'base' });
          break;

        case 'diterima':
          const timeA = a.tanggal_diterima_dibuat ? new Date(a.tanggal_diterima_dibuat).getTime() : 0;
          const timeB = b.tanggal_diterima_dibuat ? new Date(b.tanggal_diterima_dibuat).getTime() : 0;
          compareValue = timeA - timeB;
          break;

        case 'isi_disposisi':
          compareValue = a.isi_disposisi.localeCompare(b.isi_disposisi, 'id', { sensitivity: 'base' });
          break;

        default:
          compareValue = 0;
      }

      // Apply sort order (ascending or descending)
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return sorted;
  }, [data, sortField, sortOrder]);

  return {
    sortField,
    sortOrder,
    sortedData,
    handleSort,
    getSortIcon,
  };
}
