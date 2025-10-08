// file: app/(app)/admin/users/page.tsx
import { redirect } from 'next/navigation';
import { getUsers } from './actions';
import UserTableClient from '@/app/components/UserTableClient';
import LiveDateTime from '@/app/components/LiveDateTime';
import { getSession } from '@/lib/session';

export default async function UserManagementPage() {
  const session = await getSession();
  if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
    redirect('/dashboard');
  }

  const users = await getUsers();
  const currentAdminId = session?.operatorId || '';
  const currentAdminRole = session?.role || 'ADMIN';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Manajemen Pengguna</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola akun operator sistem dan hak akses mereka.</p>
        </div>
        <LiveDateTime />
      </div>
      <UserTableClient users={users} currentAdminId={currentAdminId} currentAdminRole={currentAdminRole} />
    </div>
  );
}