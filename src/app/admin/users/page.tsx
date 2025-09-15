// file: app/admin/users/page.tsx
import { getUsers } from './actions';
import UserTableClient from '@/app/components/UserTableClient'; // Path diperbaiki

export default async function UserManagementPage() {
  const users = await getUsers();

  return (
    <div>
      <div className="border-b pb-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Pengguna</h1>
      </div>
      <UserTableClient users={users} />
    </div>
  );
}