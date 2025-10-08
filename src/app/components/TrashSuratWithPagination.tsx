'use client';

import { useMemo } from 'react';
import TrashActionButtons from './TrashActionButtons';
import BulkTrashActionsToolbar from './BulkTrashActionsToolbar';
import Pagination from './Pagination';
import { useSelection } from '../hooks/useSelection';
import { usePagination } from '../hooks/usePagination';

interface DeletedSurat {
  id: string;
  perihal: string;
  nomor_surat: string;
  asal_surat: string;
  tujuan_surat: string;
  deletedAt: Date | null;
}

interface TrashSuratWithPaginationProps {
  deletedSuratList: DeletedSurat[];
}

export default function TrashSuratWithPagination({
  deletedSuratList,
}: TrashSuratWithPaginationProps) {
  // Pagination hook
  const {
    currentPageData,
    page,
    pageSize,
    totalItems,
    totalPages,
    firstItemIndex,
    lastItemIndex,
    setPage,
    setPageSize,
  } = usePagination(deletedSuratList, 25);

  // Selection hook
  const {
    selectedIds,
    selectedCount,
    selectedArray,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  } = useSelection(currentPageData);

  const allSelected = currentPageData.length > 0 && currentPageData.every(surat => selectedIds.has(surat.id));
  const someSelected = selectedIds.size > 0 && !allSelected;

  // Formatter functions
  const formatDateTime = (date: Date | string | null | undefined) => {
    if (!date) return '—';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(dateObj);
  };

  const formatRelativeTime = (date: Date | string | null | undefined) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const seconds = Math.round((dateObj.getTime() - Date.now()) / 1000);
    const divisions: Array<{ amount: number; name: Intl.RelativeTimeFormatUnit }> = [
      { amount: 60, name: 'second' },
      { amount: 60, name: 'minute' },
      { amount: 24, name: 'hour' },
      { amount: 7, name: 'day' },
      { amount: 4.34524, name: 'week' },
      { amount: 12, name: 'month' },
      { amount: Number.POSITIVE_INFINITY, name: 'year' },
    ];

    let duration = seconds;
    for (const division of divisions) {
      if (Math.abs(duration) < division.amount) {
        return new Intl.RelativeTimeFormat('id-ID', {
          numeric: 'auto',
        }).format(Math.round(duration), division.name);
      }
      duration /= division.amount;
    }

    return '';
  };

  return (
    <>
      <BulkTrashActionsToolbar
        selectedCount={selectedCount}
        selectedIds={selectedArray}
        onClearSelection={clearSelection}
        entityType="surat"
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600">
        <div className="overflow-auto max-h-[60vh] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-10">
                  <div className={`relative inline-block p-0.5 rounded transition-all duration-200 ${
                    allSelected || someSelected ? 'bg-indigo-100 dark:bg-indigo-800/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate = someSelected;
                        }
                      }}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-indigo-600 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-indigo-600 cursor-pointer transition-all duration-200 checked:border-indigo-600 dark:checked:border-indigo-500 checked:bg-indigo-600 dark:checked:bg-indigo-600"
                      aria-label="Pilih semua surat di halaman ini"
                    />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Perihal
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Nomor Surat
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Asal/Tujuan
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Tanggal Dihapus
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentPageData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                      <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center">
                        <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Tidak ada surat di kotak sampah.</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Surat yang dihapus akan muncul di sini dan dapat dipulihkan dalam waktu 30 hari.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentPageData.map((surat) => (
                  <tr 
                    key={surat.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 ${
                      selectedIds.has(surat.id) ? 'bg-indigo-100 dark:bg-indigo-900/30 border-l-4 border-indigo-600 dark:border-indigo-400' : ''
                    }`}
                  >
                    <td className="px-3 py-4 text-center">
                      <div className={`relative inline-block p-0.5 rounded transition-all duration-200 ${
                        selectedIds.has(surat.id) ? 'bg-indigo-100 dark:bg-indigo-800/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(surat.id)}
                          onChange={() => toggleSelect(surat.id)}
                          className="w-4 h-4 text-indigo-600 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-indigo-600 cursor-pointer transition-all duration-200 checked:border-indigo-600 dark:checked:border-indigo-500 checked:bg-indigo-600 dark:checked:bg-indigo-600"
                          aria-label={`Pilih surat ${surat.perihal}`}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <p className="font-semibold text-gray-900 dark:text-white">{surat.perihal}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700">
                        {surat.nomor_surat}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <div className="space-y-1">
                        {surat.asal_surat && (
                          <p className="text-xs">
                            <span className="font-medium text-gray-500 dark:text-gray-400">Dari:</span>{' '}
                            <span className="text-gray-700 dark:text-gray-300">{surat.asal_surat}</span>
                          </p>
                        )}
                        {surat.tujuan_surat && (
                          <p className="text-xs">
                            <span className="font-medium text-gray-500 dark:text-gray-400">Ke:</span>{' '}
                            <span className="text-gray-700 dark:text-gray-300">{surat.tujuan_surat}</span>
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <p className="font-medium text-gray-900 dark:text-white">{formatDateTime(surat.deletedAt)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatRelativeTime(surat.deletedAt)}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <TrashActionButtons
                        entityId={surat.id}
                        entityType="surat"
                        entityName={surat.perihal}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            firstItemIndex={firstItemIndex}
            lastItemIndex={lastItemIndex}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>
    </>
  );
}
