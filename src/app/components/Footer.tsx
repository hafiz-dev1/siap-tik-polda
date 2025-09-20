// file: app/components/Footer.tsx
'use client';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">SIAD TIK</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Sistem Informasi Administrasi Dokumen (SIAD) untuk pengelolaan surat masuk dan keluar di Bidang TIK Polda Lampung.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-wider">
              Menu Utama
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/dashboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/arsip" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Arsip Surat
                </a>
              </li>
              <li>
                <a href="/profile" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Profil
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-wider">
              Kontak
            </h4>
            <div className="space-y-3">
              <div className="flex items-start justify-center md:justify-start space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
                  Polda Lampung<br />
                  Jl. Zainal Abidin Pagar Alam No.7, Bandar Lampung
                </p>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  tik@polda.lampung.go.id
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>© {new Date().getFullYear()} Polda Lampung</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Bidang TIK</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500 dark:text-gray-500">
                Versi 1.0.0
              </span>
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-500">
                <span>Dibuat dengan</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span>oleh Tim IT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}