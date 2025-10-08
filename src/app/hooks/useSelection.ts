// file: hooks/useSelection.ts
import { useState, useCallback } from 'react';

export function useSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(prev => {
      // Jika semua item sudah terpilih, hapus semua
      if (prev.size === items.length) {
        return new Set();
      }
      // Jika tidak, pilih semua item di halaman saat ini
      return new Set(items.map(item => item.id));
    });
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectedCount = selectedIds.size;
  const selectedArray = Array.from(selectedIds);

  return {
    selectedIds,
    selectedCount,
    selectedArray,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  };
}
