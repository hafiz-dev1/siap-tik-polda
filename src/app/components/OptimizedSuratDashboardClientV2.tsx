// file: app/components/OptimizedSuratDashboardClientV2.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Surat, Lampiran, Role } from '@prisma/client';

// Components
import SearchFilters from './SearchFilters';
import DocumentTypeFilter from './DocumentTypeFilter';
import TabNavigation from './TabNavigation';
import SuratTable from './SuratTable';
import Pagination from './Pagination';
import OptimizedSuratDetailModal from './OptimizedSuratDetailModal';

// Hooks
import { useSuratFilters } from '../hooks/useSuratFilters';
import { usePagination } from '../hooks/usePagination';
import { useModalManagement } from '../hooks/useModalManagement';
import { useSuratFormatters, useExcelExport } from '../hooks/useSuratUtils';
import { useSuratSorting } from '../hooks/useSuratSorting';

type SuratWithLampiran = Surat & { lampiran: Lampiran[] };

type Props = {
  suratId: string;
  suratList: SuratWithLampiran[];
  role?: Role | null;
};

export default function OptimizedSuratDashboardClientV2({ suratId, suratList, role }: Props) {
  const [isAnimating, setIsAnimating] = useState(false);

  // Custom hooks for business logic
  const { formatEnumText, getTagColor, formatDate, formatTime, formatDispositionTarget } = useSuratFormatters();
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

  // Sorting hook - diterapkan setelah filtering
  const {
    sortField,
    sortOrder,
    sortedData,
    handleSort,
    getSortIcon,
  } = useSuratSorting(filteredSurat);

  // Always use pagination for consistent UX across all document types
  // Gunakan sortedData untuk pagination agar urutan tetap konsisten
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
  } = usePagination(sortedData, 25);

  const { isModalOpen, selectedSurat, openModal, closeModal } = useModalManagement();

  // Animation effect when filters change (but exclude pagination changes)
  useEffect(() => {
    setIsAnimating(true);
    const id = setTimeout(() => setIsAnimating(false), 220);
    return () => clearTimeout(id);
  }, [activeArah, activeTipe, fromDate, toDate, searchQuery, sortField, sortOrder]);

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

      {/* Table Section - Always use pagination for consistent UX */}
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
        onSort={handleSort}
        getSortIcon={getSortIcon}
      />

      {/* Pagination - Always shown for consistent navigation */}
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

      {/* Surat Detail Modal */}
      <OptimizedSuratDetailModal
        isOpen={isModalOpen}
        surat={selectedSurat}
        onClose={closeModal}
        formatEnumText={formatEnumText}
        formatDispositionTarget={formatDispositionTarget}
        getTagColor={getTagColor}
      />
    </div>
  );
}