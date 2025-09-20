// file: app/components/PublicNavbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { logout } from '@/app/(app)/admin/actions';

type User = {
  nama: string;
  role: string;
} | null;

type Props = {
  user: User;
};

export default function PublicNavbar({ user }: Props) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);

  const handleLogout = async (formData: FormData) => {
    setIsLoggingOut(true);
    
    // Show loading animation for 500ms
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Show success state
    setLogoutSuccess(true);
    
    // Show success animation for 300ms before redirect
    await new Promise(resolve => setTimeout(resolve, 300));
    
    await logout();
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <span className="font-bold text-xl text-gray-800 dark:text-gray-100">Arsip Surat Digital</span>
            {user && user.role === 'USER' && (
              <div className="hidden md:flex md:space-x-6">
                <Link
                  href="/user/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/user/dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  Arsip Surat
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                  Selamat datang, <span className="font-semibold text-gray-800 dark:text-gray-100">{user.nama}</span>!
                </span>
                <form action={handleLogout}>
                  <button 
                    type="submit" 
                    disabled={isLoggingOut || logoutSuccess}
                    className={`
                      px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ease-in-out
                      ${logoutSuccess
                        ? 'bg-green-100 text-green-700 border border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-500/30' 
                        : isLoggingOut 
                          ? 'bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500 dark:border-gray-600' 
                          : 'text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 hover:text-red-700 transform hover:scale-105 active:scale-95 dark:bg-red-900/20 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:border-red-500/50'
                      }
                    `}
                  >
                    {logoutSuccess ? (
                      <div className="flex items-center space-x-2">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4 text-green-600 dark:text-green-400 animate-pulse" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M5 13l4 4L19 7" 
                          />
                        </svg>
                        <span>Berhasil!</span>
                      </div>
                    ) : isLoggingOut ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>Keluar...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                          />
                        </svg>
                        <span>Logout</span>
                      </div>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-500 dark:hover:bg-indigo-900/30">
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
