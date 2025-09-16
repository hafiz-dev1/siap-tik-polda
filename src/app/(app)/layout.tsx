// file: app/(app)/layout.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; // <-- 1. Impor Komponen Image
import { getSession } from '@/lib/session';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const user = await prisma.pengguna.findUnique({
    where: { id: session.operatorId },
    select: { nama: true, role: true, profilePictureUrl: true } // <-- Pastikan profilePictureUrl diambil
  });

  async function handleLogout() {
    'use server';
    (await cookies()).delete('token');
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <span className="font-bold text-xl text-gray-800">SIAD POLDA</span>
              
              {/* Navigasi Dinamis berdasarkan Peran */}
              <div className="hidden md:flex md:space-x-6">
                <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/arsip" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                  Arsip Surat
                </Link>
                {user?.role === 'ADMIN' && (
                  <>
                    <Link href="/admin/users" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                      Manajemen Pengguna
                    </Link>
                    <Link href="/admin/trash" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                      Tempat Sampah
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            {/* --- BAGIAN YANG DIPERBARUI --- */}
            <div className="flex items-center space-x-4">
              {/* 2. Link "Profil" yang lama dihapus */}

              {/* 3. Foto Profil dan Nama sekarang menjadi link ke halaman profil */}
              <Link href="/profile" className="flex items-center space-x-2 rounded-full p-1 pr-3 transition-colors hover:bg-gray-100">
                <Image
                  className="h-8 w-8 rounded-full object-cover"
                  src={user?.profilePictureUrl || '/default-profile.png'}
                  alt="Foto"
                  width={32}
                  height={32}
                />
                <span className="text-sm font-semibold text-gray-800 hidden sm:block">
                  {user?.nama}
                </span>
              </Link>
              
              {/* Tombol Logout tetap ada */}
              <form action={handleLogout}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none"
                >
                  Logout
                </button>
              </form>
            </div>
            {/* --- AKHIR BAGIAN YANG DIPERBARUI --- */}
            
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}