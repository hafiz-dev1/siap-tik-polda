// file: app/components/Footer.tsx
'use client';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center space-y-3">
          {/* Main Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
              Sistem Informasi Arsip Polda (SIAP)
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Bidang TIK Polda Lampung
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 mx-auto max-w-xs"></div>

          {/* Copyright & Version */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-3 text-xs text-gray-500 dark:text-gray-500">
            <span>© {new Date().getFullYear()} Polda Lampung</span>
            <span className="hidden sm:inline">•</span>
            <span>Versi 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}