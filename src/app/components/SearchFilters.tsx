'use client';

import { memo, useCallback } from 'react';
import DateRangeFilter from './DateRangeFilter';

interface SearchFiltersProps {
  searchQuery: string;
  fromDate: string;
  toDate: string;
  suratDari: string;
  kepada: string;
  onSearchChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onSuratDariChange: (value: string) => void;
  onKepadaChange: (value: string) => void;
  onResetFilters: () => void;
}

const SearchFilters = memo(function SearchFilters({
  searchQuery,
  fromDate,
  toDate,
  suratDari,
  kepada,
  onSearchChange,
  onFromDateChange,
  onToDateChange,
  onSuratDariChange,
  onKepadaChange,
  onResetFilters,
}: SearchFiltersProps) {
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  const handleSearchClear = useCallback(() => {
    onSearchChange('');
  }, [onSearchChange]);

  const handleSuratDariChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSuratDariChange(e.target.value);
  }, [onSuratDariChange]);

  const handleSuratDariClear = useCallback(() => {
    onSuratDariChange('');
  }, [onSuratDariChange]);

  const handleKepadaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onKepadaChange(e.target.value);
  }, [onKepadaChange]);

  const handleKepadaClear = useCallback(() => {
    onKepadaChange('');
  }, [onKepadaChange]);

  const hasActiveFilters = fromDate || toDate || searchQuery || suratDari || kepada;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Semua filter dalam 1 baris */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search Input */}
        <div className="flex-1 relative min-w-[220px]">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
          <input
            type="text"
            placeholder="Cari surat..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-300 dark:focus:border-gray-600 transition-all text-sm placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={handleSearchClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
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
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Surat Dari */}
        <div className="relative w-[180px]">
          <input
            type="text"
            placeholder="Surat dari..."
            value={suratDari}
            onChange={handleSuratDariChange}
            className="w-full pl-3 pr-8 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-300 dark:focus:border-gray-600 transition-all text-sm placeholder-gray-400"
          />
          {suratDari && (
            <button
              onClick={handleSuratDariClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
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
        </div>

        {/* Filter Kepada */}
        <div className="relative w-[180px]">
          <input
            type="text"
            placeholder="Kepada..."
            value={kepada}
            onChange={handleKepadaChange}
            className="w-full pl-3 pr-8 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-300 dark:focus:border-gray-600 transition-all text-sm placeholder-gray-400"
          />
          {kepada && (
            <button
              onClick={handleKepadaClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
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
        </div>

        {/* Date Range Filter */}
        <DateRangeFilter
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={onFromDateChange}
          onToDateChange={onToDateChange}
        />

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            title="Reset Filter"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            Reset
          </button>
        )}
      </div>
    </div>
  );
});

export default SearchFilters;