// file: app/components/UserTableClient.tsx
'use client';

import { Pengguna } from '@prisma/client';
import Image from 'next/image';
import { Users, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import UserFormModal from './UserFormModal';
import DeleteUserButton from './DeleteUserButton';
import { useState, useMemo } from 'react';

type Props = {
  users: Pengguna[];
  currentAdminId: string;
  currentAdminRole: string;
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

export default function UserTableClient({ users, currentAdminId, currentAdminRole }: Props) {
  // State untuk pagination dan search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10; // Batasan 10 user per halaman

  // Filter users berdasarkan search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.nama.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Hitung pagination
  const totalFilteredUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalFilteredUsers / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset ke halaman 1 jika search berubah
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
          {currentAdminRole === 'SUPER_ADMIN' && <UserFormModal />}
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, username, atau role..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200"
            />
            {searchQuery && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Menampilkan {totalFilteredUsers} dari {totalUsers} pengguna
            </p>
          )}
        </div>

        {/* Table dengan max height dan scroll */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
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
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                      <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center">
                        <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                      </div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        {searchQuery ? 'Tidak ada pengguna yang cocok dengan pencarian.' : 'Belum ada data pengguna.'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {searchQuery ? 'Coba kata kunci lain.' : 'Tambahkan pengguna baru untuk memulai.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
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
                        {(() => {
                          // Cek apakah ini akun super_admin yang dilindungi
                          const isProtectedSuperAdmin = user.username === 'superadmin' || user.role === 'SUPER_ADMIN';
                          
                          if (currentAdminRole === 'ADMIN') {
                            // Admin hanya bisa hapus akun sendiri
                            if (user.id === currentAdminId) {
                              return <DeleteUserButton userId={user.id} />;
                            } else {
                              return (
                                <span className="inline-flex items-center rounded-full bg-gray-50 dark:bg-gray-900/30 px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                  Akses Terbatas
                                </span>
                              );
                            }
                          } else {
                            // Super Admin: cek apakah user yang akan diedit/hapus adalah super_admin yang dilindungi
                            if (isProtectedSuperAdmin) {
                              return (
                                <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-900/30 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700">
                                  Akun Dilindungi
                                </span>
                              );
                            } else {
                              // Akun biasa bisa diubah dan dihapus
                              return (
                                <>
                                  <UserFormModal userToEdit={user} />
                                  <DeleteUserButton userId={user.id} />
                                </>
                              );
                            }
                          }
                        })()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                {/* Mobile pagination */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Menampilkan <span className="font-medium">{startIndex + 1}</span> sampai{' '}
                    <span className="font-medium">{Math.min(endIndex, totalFilteredUsers)}</span> dari{' '}
                    <span className="font-medium">{totalFilteredUsers}</span> pengguna
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {/* Previous button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Sebelumnya</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      // Show first page, last page, current page, and pages around current page
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNum === currentPage
                                ? 'z-10 bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return (
                          <span
                            key={pageNum}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}

                    {/* Next button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Selanjutnya</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}