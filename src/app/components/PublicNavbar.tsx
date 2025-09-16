// file: app/components/PublicNavbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
                <form action={logout}>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 bg-red-50 rounded-md hover:bg-red-100 dark:bg-red-900/20 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-900/40">
                    Logout
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
