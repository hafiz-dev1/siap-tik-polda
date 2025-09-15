// file: app/admin/layout.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link'; // Impor komponen Link untuk navigasi

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  // Server Action untuk menangani proses logout
  async function handleLogout() {
    'use server';

    // Menghapus cookie 'token' dari browser
    const cookieStore = await cookies();
    cookieStore.delete('token');
    
    // Mengarahkan pengguna kembali ke halaman login
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Atas yang konsisten di semua halaman admin */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              {/* Judul Aplikasi */}
              <span className="font-bold text-xl text-gray-800">
                SIAD POLDA - Admin
              </span>
              
              {/* Link Navigasi Utama */}
              <div className="flex space-x-6">
                <Link href="/admin/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  Dashboard
                </Link>
                <Link href="/admin/arsip" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                  Arsip Surat
                </Link>
              </div>
            </div>

            {/* Tombol Logout */}
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

      {/* Konten Halaman (Dashboard atau Arsip) akan dirender di sini */}
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}