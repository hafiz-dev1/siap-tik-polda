// file: app/(app)/admin/users/page.tsx
import { redirect } from 'next/navigation';
import { getUsers } from './actions';
import UserTableClient from '@/app/components/UserTableClient';
import { getSession } from '@/lib/session'; // <-- Impor getSession

export default async function UserManagementPage() {
  const session = await getSession(); // <-- Dapatkan data sesi
  if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
    redirect('/dashboard');
  }

  const users = await getUsers();
  const currentAdminId = session?.operatorId || ''; // <-- Dapatkan ID admin

  return (
    <div>
      <div className="border-b pb-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Pengguna</h1>
      </div>
      {/* Kirim ID admin saat ini sebagai prop */}
      <UserTableClient users={users} currentAdminId={currentAdminId} />
    </div>
  );
}