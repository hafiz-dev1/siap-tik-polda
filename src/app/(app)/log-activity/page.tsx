// file: src/app/(app)/log-activity/page.tsx
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import ActivityLogClient from './ActivityLogClient';

export const metadata: Metadata = {
  title: 'Log Aktivitas | SIAP',
  description: 'Riwayat aktivitas pengguna',
};

export default async function LogActivityPage() {
  const session = await getSession();

  if (!session?.operatorId) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Log Aktivitas
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Riwayat aktivitas pengguna dalam sistem
          </p>
        </div>

        <ActivityLogClient session={session} />
      </div>
    </div>
  );
}
