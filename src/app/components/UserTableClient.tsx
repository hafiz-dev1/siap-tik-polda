// file: app/components/UserTableClient.tsx
'use client';

import { Pengguna } from '@prisma/client';
import Image from 'next/image';
import { Users } from 'lucide-react';
import UserFormModal from './UserFormModal';
import DeleteUserButton from './DeleteUserButton';

type Props = {
  users: Pengguna[];
  currentAdminId: string;
};

function getInitials(name: string) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

  return initials || name.slice(0, 2).toUpperCase() || '??';
}

export default function UserTableClient({ users, currentAdminId }: Props) {
  const totalUsers = users.length;
  const totalSuperAdmin = users.filter(u => u.role === 'SUPER_ADMIN').length;
  const totalAdmin = users.filter(u => u.role === 'ADMIN').length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Pengguna</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{totalUsers}</p>
            </div>
            <div className="flex-shrink-0 bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50 dark:from-indigo-900/30 dark:via-sky-900/30 dark:to-emerald-900/30 rounded-full p-3">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Akun aktif dalam sistem</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Super Admin</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{totalSuperAdmin}</p>
            </div>
            <div className="flex-shrink-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/30 dark:via-orange-900/30 dark:to-yellow-900/30 rounded-full p-3">
              <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Akses penuh ke sistem</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Admin</p>
              <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{totalAdmin}</p>
            </div>
            <div className="flex-shrink-0 bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 dark:from-purple-900/30 dark:via-fuchsia-900/30 dark:to-pink-900/30 rounded-full p-3">
              <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Operator standar</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600">
        <div className="flex items-center justify-between border-b-2 border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Daftar Pengguna Aktif</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Kelola akun dan hak akses pengguna</p>
          </div>
          <UserFormModal />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Profil
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Username
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Peran
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                      <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center">
                        <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                      </div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Belum ada data pengguna.</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Tambahkan pengguna baru untuk memulai.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-3">
                        {user.profilePictureUrl ? (
                          <Image
                            src={user.profilePictureUrl}
                            alt={`Foto profil ${user.nama}`}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-sm font-semibold text-indigo-700 dark:text-indigo-300 border-2 border-indigo-200 dark:border-indigo-700">
                            {getInitials(user.nama)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{user.nama}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <p className="font-medium text-gray-900 dark:text-white">@{user.username}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {(() => {
                        const isSuperAdmin = user.role === 'SUPER_ADMIN';
                        const badgeClass = isSuperAdmin
                          ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-700'
                          : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-700';
                        const roleLabel = isSuperAdmin ? 'Super Admin' : 'Admin';
                        return (
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${badgeClass}`}>
                            {roleLabel}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center space-x-4">
                        {user.id === currentAdminId ? (
                          <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700">
                            Akun Anda
                          </span>
                        ) : (
                          <>
                            <UserFormModal userToEdit={user} />
                            <DeleteUserButton userId={user.id} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}