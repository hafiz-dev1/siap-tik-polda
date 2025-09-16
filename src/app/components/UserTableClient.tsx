// file: app/components/UserTableClient.tsx
'use client';

import { Pengguna } from '@prisma/client';
import Image from 'next/image';
import UserFormModal from './UserFormModal';
import DeleteUserButton from './DeleteUserButton';

type Props = {
  users: Pengguna[];
  currentAdminId: string; // ID admin yang sedang login, didapat dari server
};

export default function UserTableClient({ users, currentAdminId }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Daftar Pengguna Aktif</h2>
        {/* Tombol untuk memicu modal 'Tambah Pengguna' (mode default) */}
        <UserFormModal />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Profil
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Username
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Peran
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-500 dark:text-gray-400">
                  Belum ada data pengguna.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10">
                        <Image
                          className="w-full h-full rounded-full object-cover"
                          src={user.profilePictureUrl || '/default-profile.png'}
                          alt="Foto profil"
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-900 dark:text-white font-semibold whitespace-no-wrap">{user.nama}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                    <p className="text-gray-900 dark:text-gray-100 whitespace-no-wrap">{user.username}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      user.role === 'ADMIN' ? 'text-green-900 dark:text-green-200' : 'text-blue-900 dark:text-blue-200'
                    }`}>
                      <span aria-hidden className={`absolute inset-0 ${
                        user.role === 'ADMIN' ? 'bg-green-200 dark:bg-green-700' : 'bg-blue-200 dark:bg-blue-700'
                      } opacity-50 rounded-full`}></span>
                      <span className="relative">{user.role}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-transparent text-sm">
                    <div className="flex space-x-4">
                      {/* Logika Keamanan UI (Self-Action Prevention):
                        Mencegah admin yang sedang login untuk mengubah atau menghapus akunnya sendiri.
                      */}
                      {user.id === currentAdminId ? (
                        <span className="text-xs text-gray-400 dark:text-gray-500 italic">Ini Akun Anda</span>
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
  );
}