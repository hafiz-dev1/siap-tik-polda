'use client';

import { memo, useCallback } from 'react';
import { TipeDokumen, Role } from '@prisma/client';
import SuratFormModal from './SuratFormModal';

interface DocumentTypeFilterProps {
  activeTipe: string;
  tipeCounts: Record<string, number>;
  role?: Role | null;
  onTipeChange: (tipe: string) => void;
  onExportToExcel: () => void;
  formatEnumText: (text: string) => string;
}

const TIPE_DOKUMEN_ORDER: TipeDokumen[] = ['NOTA_DINAS', 'SURAT_BIASA', 'SPRIN', 'TELEGRAM'];

const DocumentTypeFilter = memo(function DocumentTypeFilter({
  activeTipe,
  tipeCounts,
  role,
  onTipeChange,
  onExportToExcel,
  formatEnumText,
}: DocumentTypeFilterProps) {
  const handleTipeClick = useCallback((tipe: string) => {
    onTipeChange(tipe);
  }, [onTipeChange]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg px-5 py-4 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center flex-wrap gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 text-gray-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            Tipe Dokumen:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTipeClick('ALL')}
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
                onClick={() => handleTipeClick(tipe)}
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
            onClick={onExportToExcel}
            type="button"
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all whitespace-nowrap flex items-center gap-1.5 text-sm cursor-pointer"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
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
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                  />
                </svg>
                Tambah Surat
              </button>
            </SuratFormModal>
          )}
        </div>
      </div>
    </div>
  );
});

export default DocumentTypeFilter;