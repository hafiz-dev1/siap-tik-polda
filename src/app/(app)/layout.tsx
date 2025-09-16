// file: app/(app)/layout.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getSession } from '@/lib/session';
import { PrismaClient } from '@prisma/client';
import ThemeSwitcher from '@/app/components/ThemeSwitcher'; // Impor tombol dark mode

const prisma = new PrismaClient();

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/login'); // Pengaman ganda jika middleware gagal
  }

  // Ambil data lengkap pengguna untuk ditampilkan di navbar
  const user = await prisma.pengguna.findUnique({
    where: { id: session.operatorId },
    select: { nama: true, role: true, profilePictureUrl: true }
  });

  // Server Action untuk logout
  async function handleLogout() {
    'use server';
    (await cookies()).delete('token');
    redirect('/login');
  }

  return (
    // Tambahkan styling dark mode ke latar belakang utama
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white border-b border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <span className="font-bold text-xl text-gray-800 dark:text-gray-100">SIAD POLDA</span>
              
              {/* Navigasi Dinamis berdasarkan Peran */}
              <div className="hidden md:flex md:space-x-6">
                {/* Link yang dilihat SEMUA pengguna yang login */}
                <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/arsip" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                  Arsip Surat
                </Link>
                
                {/* Link yang HANYA dilihat oleh ADMIN */}
                {user?.role === 'ADMIN' && (
                  <>
                    <Link href="/admin/users" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                      Manajemen Pengguna
                    </Link>
                    <Link href="/admin/trash" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                      Tempat Sampah
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            {/* Area Kanan Navbar */}
            <div className="flex items-center space-x-4">
              {/* Tombol Profil (Foto + Nama) */}
              <Link href="/profile" className="flex items-center space-x-2 rounded-full p-1 pr-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
                <Image
                  className="h-8 w-8 rounded-full object-cover"
                  src={user?.profilePictureUrl || '/default-profile.png'}
                  alt="Foto profil"
                  width={32}
                  height={32}
                />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 hidden sm:block">
                  {user?.nama}
                </span>
              </Link>
              
              {/* Tombol Logout */}
              <form action={handleLogout}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none"
                >
                  Logout
                </button>
              </form>

              {/* Tombol Dark Mode */}
              <ThemeSwitcher />
            </div>
            
          </div>
        </div>
      </nav>

      {/* Render konten halaman */}
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}