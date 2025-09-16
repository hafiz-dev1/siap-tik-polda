// file: app/components/UserTableClient.tsx
'use client';

import { Pengguna } from '@prisma/client';
import Image from 'next/image';
import UserFormModal from './UserFormModal';
import DeleteUserButton from './DeleteUserButton';

type Props = {
  users: Pengguna[];
  currentAdminId: string; // ID admin yang sedang login
};

export default function UserTableClient({ users, currentAdminId }: Props) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-800">Daftar Pengguna Aktif</h2>
        {/* Tombol untuk memicu modal 'Tambah Pengguna' */}
        <UserFormModal />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Profil
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Username
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Peran
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-500">
                  Belum ada data pengguna.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
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
                        <p className="text-gray-900 font-semibold whitespace-no-wrap">{user.nama}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{user.username}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      user.role === 'ADMIN' ? 'text-green-900' : 'text-blue-900'
                    }`}>
                      <span aria-hidden className={`absolute inset-0 ${
                        user.role === 'ADMIN' ? 'bg-green-200' : 'bg-blue-200'
                      } opacity-50 rounded-full`}></span>
                      <span className="relative">{user.role}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex space-x-4">
                      {/* Logika Keamanan UI:
                        Tombol 'Ubah' dan 'Hapus' hanya muncul jika ID pengguna di baris ini
                        TIDAK SAMA DENGAN ID admin yang sedang login.
                      */}
                      {user.id === currentAdminId ? (
                        <span className="text-xs text-gray-400 italic">Ini Akun Anda</span>
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