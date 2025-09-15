// file: app/admin/layout.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link'; // Import the Link component for client-side navigation

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  // Server Action to handle the logout process
  async function handleLogout() {
    'use server';

    // Delete the 'token' cookie from the browser
    const cookieStore = await cookies();
    cookieStore.delete('token');
    
    // Redirect the user back to the login page
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar, consistent across all admin pages */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              {/* Application Title */}
              <span className="font-bold text-xl text-gray-800">
                SIAD POLDA - Admin
              </span>
              
              {/* Main Navigation Links */}
              <div className="hidden md:flex md:space-x-6">
                <Link href="/admin/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  Dashboard
                </Link>
                <Link href="/admin/arsip" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  Arsip Surat
                </Link>
                <Link href="/admin/users" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  Manajemen Pengguna
                </Link>
              </div>
            </div>

            {/* Logout Button */}
            <div className="flex items-center">
              <form action={handleLogout}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content (either Dashboard, Arsip, or Users) will be rendered here */}
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}