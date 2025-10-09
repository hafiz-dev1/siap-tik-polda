'use client';

import { memo, useCallback } from 'react';

interface PaginationProps {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  firstItemIndex: number;
  lastItemIndex: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const Pagination = memo(function Pagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  firstItemIndex,
  lastItemIndex,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange(Number(e.target.value));
  }, [onPageSizeChange]);

  const goToFirstPage = useCallback(() => onPageChange(1), [onPageChange]);
  const goToLastPage = useCallback(() => onPageChange(totalPages), [onPageChange, totalPages]);
  const goToPrevPage = useCallback(() => onPageChange(Math.max(1, page - 1)), [onPageChange, page]);
  const goToNextPage = useCallback(() => onPageChange(Math.min(totalPages, page + 1)), [onPageChange, page, totalPages]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-gray-200 dark:border-gray-700 text-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">Tampilkan:</span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
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
          onClick={goToFirstPage}
          disabled={page === 1}
          className={`w-9 h-9 flex items-center justify-center rounded border text-sm ${
            page === 1
              ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600'
              : 'cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
          }`}
          aria-label="First Page"
        >
          «
        </button>
        <button
          onClick={goToPrevPage}
          disabled={page === 1}
          className={`px-3 h-9 rounded border text-sm flex items-center ${
            page === 1
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
          {page} / {totalPages}
        </span>
        <button
          onClick={goToNextPage}
          disabled={page === totalPages}
          className={`px-3 h-9 rounded border text-sm flex items-center ${
            page === totalPages
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
          onClick={goToLastPage}
          disabled={page === totalPages}
          className={`w-9 h-9 flex items-center justify-center rounded border text-sm ${
            page === totalPages
              ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600'
              : 'cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
          }`}
          aria-label="Last Page"
        >
          »
        </button>
      </div>
    </div>
  );
});

export default Pagination;