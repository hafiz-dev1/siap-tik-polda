// file: app/(app)/layout.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/session'; // Pastikan path ini benar
import { PrismaClient } from '@prisma/client';

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

  const user = await prisma.pengguna.findUnique({
    where: { id: session.operatorId },
    select: { nama: true, role: true }
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
              <div className="flex space-x-6">
                <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link href="/arsip" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                  Arsip Surat
                </Link>
                {/* Hanya tampilkan link ini jika user adalah ADMIN */}
                {user?.role === 'ADMIN' && (
                  <Link href="/admin/users" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                    Manajemen Pengguna
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Hi, <span className="font-semibold">{user?.nama}</span>!</span>
              <form action={handleLogout}>
                <button type="submit" className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700">
                  Logout
                </button>
              </form>
            </div>
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