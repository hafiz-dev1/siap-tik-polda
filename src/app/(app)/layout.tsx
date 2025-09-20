// file: app/(app)/layout.tsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import ModernNavbar from '@/app/components/ModernNavbar';
import { prisma } from '@/lib/prisma';

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
  const rawUser = await prisma.pengguna.findUnique({
    where: { id: session.operatorId },
    select: { nama: true, role: true, profilePictureUrl: true }
  });

  const user = rawUser
    ? {
        ...rawUser,
        profilePictureUrl: rawUser.profilePictureUrl ?? undefined,
      }
    : null;

  if (!user) {
    redirect('/login');
  }

  // Server Action untuk logout
  async function handleLogout() {
    'use server';
    (await cookies()).delete('token');
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ModernNavbar user={user} onLogout={handleLogout} />
      
      {/* Render konten halaman */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}