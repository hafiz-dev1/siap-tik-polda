'use client';

import { memo, useCallback } from 'react';

interface TabNavigationProps {
  activeArah: 'MASUK' | 'KELUAR';
  tabCounts: { MASUK: number; KELUAR: number };
  onArahChange: (arah: 'MASUK' | 'KELUAR') => void;
}

const TabNavigation = memo(function TabNavigation({
  activeArah,
  tabCounts,
  onArahChange,
}: TabNavigationProps) {
  const handleMasukClick = useCallback(() => {
    onArahChange('MASUK');
  }, [onArahChange]);

  const handleKeluarClick = useCallback(() => {
    onArahChange('KELUAR');
  }, [onArahChange]);

  return (
    <div className="flex bg-gray-50 dark:bg-gray-800/50 p-1 rounded-lg">
      <button
        onClick={handleMasukClick}
        className={`flex-1 py-2.5 px-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-md cursor-pointer ${
          activeArah === 'MASUK'
            ? 'bg-gradient-to-r from-indigo-700 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-indigo-500 hover:from-indigo-800 hover:to-indigo-700'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-700/60'
        }`}
      >
        <span>Surat Masuk</span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          activeArah === 'MASUK'
            ? 'bg-white/20 text-white font-semibold'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}>
          {tabCounts.MASUK}
        </span>
      </button>
      
      <button
        onClick={handleKeluarClick}
        className={`flex-1 py-2.5 px-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-md cursor-pointer ${
          activeArah === 'KELUAR'
            ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-500 hover:from-emerald-800 hover:to-emerald-700'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-700/60'
        }`}
      >
        <span>Surat Keluar</span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          activeArah === 'KELUAR'
            ? 'bg-white/20 text-white font-semibold'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}>
          {tabCounts.KELUAR}
        </span>
      </button>
    </div>
  );
});

export default TabNavigation;