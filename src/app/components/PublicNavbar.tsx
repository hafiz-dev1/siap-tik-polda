// file: app/components/PublicNavbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Hook to detect the current page
import { logout } from '@/app/admin/actions'; // Adjust path if your alias is different

// Define the type for the user prop, allowing it to be null
type User = {
  nama: string;
  role: string;
} | null;

type Props = {
  user: User;
};

export default function PublicNavbar({ user }: Props) {
  const pathname = usePathname(); // Get the current URL path

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <span className="font-bold text-xl text-gray-800">Arsip Surat Digital</span>
            
            {/* Navigation links are only shown if a user is logged in */}
            {user && user.role === 'USER' && (
              <div className="hidden md:flex md:space-x-6">
                {/* Link styling changes based on whether it's the active page */}
                <Link
                  href="/"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/'
                      ? 'text-indigo-600' // Style for the active link
                      : 'text-gray-500 hover:text-gray-900' // Style for inactive links
                  }`}
                >
                  Dashboard
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              // If user is logged in, show their name and a logout button
              <>
                <span className="text-sm text-gray-600 hidden sm:block">
                  Selamat datang, <span className="font-semibold">{user.nama}</span>!
                </span>
                <form action={logout}>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 bg-red-50 rounded-md hover:bg-red-100">
                    Logout
                  </button>
                </form>
              </>
            ) : (
              // If no user is logged in, show the admin login button
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50">
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}