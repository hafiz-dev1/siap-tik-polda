// file: app/components/OptimizedSuratDashboardClientV2.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Surat, Lampiran, Role } from '@prisma/client';

// Components
import SearchFilters from './SearchFilters';
import DocumentTypeFilter from './DocumentTypeFilter';
import TabNavigation from './TabNavigation';
import SuratTable from './SuratTable';
import VirtualizedSuratTable from './VirtualizedSuratTable';
import Pagination from './Pagination';
import OptimizedSuratDetailModal from './OptimizedSuratDetailModal';

// Hooks
import { useSuratFilters } from '../hooks/useSuratFilters';
import { usePagination } from '../hooks/usePagination';
import { useModalManagement } from '../hooks/useModalManagement';
import { useSuratFormatters, useExcelExport } from '../hooks/useSuratUtils';

type SuratWithLampiran = Surat & { lampiran: Lampiran[] };

type Props = {
  suratId: string;
  suratList: SuratWithLampiran[];
  role?: Role | null;
};

const VIRTUALIZATION_THRESHOLD = 100; // Use virtualization for more than 100 items

export default function OptimizedSuratDashboardClientV2({ suratId, suratList, role }: Props) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Custom hooks for business logic
  const { formatEnumText, getTagColor, formatDate, formatTime } = useSuratFormatters();
  const { exportToExcel } = useExcelExport();
  
  const {
    activeTipe,
    activeArah,
    searchQuery,
    fromDate,
    toDate,
    filteredSurat,
    tipeCounts,
    tabCounts,
    setActiveTipe,
    setActiveArah,
    setSearchQuery,
    setFromDate,
    setToDate,
    resetFilters,
  } = useSuratFilters(suratList, formatEnumText);

  // Decide whether to use virtualization or pagination
  const useVirtualization = filteredSurat.length > VIRTUALIZATION_THRESHOLD;
  
  const {
    currentPageData: currentPageSurat,
    page,
    pageSize,
    totalItems,
    totalPages,
    firstItemIndex,
    lastItemIndex,
    setPage,
    setPageSize,
  } = usePagination(filteredSurat, useVirtualization ? filteredSurat.length : 25);

  const { isModalOpen, selectedSurat, openModal, closeModal } = useModalManagement();

  // Animation effect when filters change (but exclude pagination changes)
  useEffect(() => {
    setIsAnimating(true);
    const id = setTimeout(() => setIsAnimating(false), 220);
    return () => clearTimeout(id);
  }, [activeArah, activeTipe, fromDate, toDate, searchQuery]);

  // Optimized event handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, [setSearchQuery]);

  const handleFromDateChange = useCallback((value: string) => {
    setFromDate(value);
  }, [setFromDate]);

  const handleToDateChange = useCallback((value: string) => {
    setToDate(value);
  }, [setToDate]);

  const handleTipeChange = useCallback((tipe: string) => {
    setActiveTipe(tipe);
  }, [setActiveTipe]);

  const handleArahChange = useCallback((arah: 'MASUK' | 'KELUAR') => {
    setActiveArah(arah);
  }, [setActiveArah]);

  const handleExportToExcel = useCallback(() => {
    exportToExcel(suratList);
  }, [exportToExcel, suratList]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Search and Filter Section */}
      <SearchFilters
        searchQuery={searchQuery}
        fromDate={fromDate}
        toDate={toDate}
        onSearchChange={handleSearchChange}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
        onResetFilters={resetFilters}
      />

      {/* Document Type Filter Section */}
      <DocumentTypeFilter
        activeTipe={activeTipe}
        tipeCounts={tipeCounts}
        role={role}
        onTipeChange={handleTipeChange}
        onExportToExcel={handleExportToExcel}
        formatEnumText={formatEnumText}
      />

      {/* Tabs (Surat Masuk / Keluar) */}
      <TabNavigation
        activeArah={activeArah}
        tabCounts={tabCounts}
        onArahChange={handleArahChange}
      />

      {/* Performance indicator
      {useVirtualization && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-medium">
              Mode Virtualisasi Aktif - Menampilkan {filteredSurat.length} item dengan performa optimal
            </span>
          </div>
        </div>
      )} */}

      {/* Table Section - Conditional rendering based on data size */}
      {useVirtualization ? (
        <VirtualizedSuratTable
          suratData={filteredSurat}
          role={role}
          isAnimating={isAnimating}
          firstItemIndex={1}
          onSuratClick={openModal}
          formatEnumText={formatEnumText}
          formatDate={formatDate}
          formatTime={formatTime}
          getTagColor={getTagColor}
        />
      ) : (
        <>
          <SuratTable
            suratData={currentPageSurat}
            role={role}
            isAnimating={isAnimating}
            firstItemIndex={firstItemIndex}
            onSuratClick={openModal}
            formatEnumText={formatEnumText}
            formatDate={formatDate}
            formatTime={formatTime}
            getTagColor={getTagColor}
          />

          {/* Pagination - Only show when not using virtualization */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
          </div>
        </>
      )}

      {/* Surat Detail Modal */}
      <OptimizedSuratDetailModal
        isOpen={isModalOpen}
        surat={selectedSurat}
        onClose={closeModal}
        formatEnumText={formatEnumText}
        getTagColor={getTagColor}
      />
    </div>
  );
}