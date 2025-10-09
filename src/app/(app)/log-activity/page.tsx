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
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
            Log Aktivitas
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Riwayat aktivitas pengguna dalam sistem
          </p>
        </div>
      </div>

      <ActivityLogClient session={session} />
    </div>
  );
}
