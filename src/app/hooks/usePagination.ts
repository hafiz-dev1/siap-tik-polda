import { useState, useMemo, useEffect } from 'react';

export function usePagination<T>(data: T[], initialPageSize = 25) {
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [page, setPage] = useState<number>(1);

  // Reset page when data changes
  useEffect(() => {
    setPage(1);
  }, [data]);

  // Reset page when pageSize changes
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  // Pagination calculations
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  
  // Keep page in range
  useEffect(() => {
    if (safePage !== page) {
      setPage(safePage);
    }
  }, [safePage, page]);

  const currentPageData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize]);

  const firstItemIndex = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const lastItemIndex = totalItems === 0 ? 0 : Math.min(safePage * pageSize, totalItems);

  return {
    // Current page data
    currentPageData,
    
    // Pagination info
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
    firstItemIndex,
    lastItemIndex,
    
    // Actions
    setPage,
    setPageSize,
  };
}