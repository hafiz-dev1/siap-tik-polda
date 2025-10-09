'use client';

import { memo, useState, useRef, useEffect } from 'react';

interface DateRangeFilterProps {
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
}

const DateRangeFilter = memo(function DateRangeFilter({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const hasDateRange = fromDate || toDate;

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFromDateChange('');
    onToDateChange('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2.5 text-sm rounded-md transition-colors border flex items-center gap-2 cursor-pointer whitespace-nowrap ${
          hasDateRange
            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700'
            : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
        title="Filter Rentang Tanggal"
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
        {hasDateRange ? (
          <span>
            {fromDate || '...'} — {toDate || '...'}
          </span>
        ) : (
          <span>Tanggal</span>
        )}
        {hasDateRange && (
          <button
            onClick={handleClear}
            className="ml-1 hover:text-indigo-900 dark:hover:text-indigo-100"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-3.5 w-3.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-10 min-w-[280px]">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => onFromDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => onToDateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default DateRangeFilter;
