'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import TrashActionButtons from './TrashActionButtons';
import BulkTrashActionsToolbar from './BulkTrashActionsToolbar';
import Pagination from './Pagination';
import { useSelection } from '../hooks/useSelection';
import { usePagination } from '../hooks/usePagination';

interface DeletedUser {
  id: string;
  nama: string;
  username: string;
  role: string;
  profilePictureUrl: string | null;
  deletedAt: Date | null;
}

interface TrashUsersWithPaginationProps {
  deletedUsers: DeletedUser[];
  userRole?: string; // Role user yang sedang login
}

function getInitials(name: string) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

  return initials || name.slice(0, 2).toUpperCase() || '??';
}

export default function TrashUsersWithPagination({
  deletedUsers,
  userRole,
}: TrashUsersWithPaginationProps) {
  // Pagination hook
  const {
    currentPageData,
    page,
    pageSize,
    totalItems,
    totalPages,
    firstItemIndex,
    lastItemIndex,
    setPage,
    setPageSize,
  } = usePagination(deletedUsers, 25);

  // Selection hook
  const {
    selectedIds,
    selectedCount,
    selectedArray,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  } = useSelection(currentPageData);

  const allSelected = currentPageData.length > 0 && currentPageData.every(user => selectedIds.has(user.id));
  const someSelected = selectedIds.size > 0 && !allSelected;

  // Cek apakah user adalah SUPER_ADMIN
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  // Formatter functions
  const formatDateTime = (date: Date | string | null | undefined) => {
    if (!date) return '—';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(dateObj);
  };

  const formatRelativeTime = (date: Date | string | null | undefined) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const seconds = Math.round((dateObj.getTime() - Date.now()) / 1000);
    const divisions: Array<{ amount: number; name: Intl.RelativeTimeFormatUnit }> = [
      { amount: 60, name: 'second' },
      { amount: 60, name: 'minute' },
      { amount: 24, name: 'hour' },
      { amount: 7, name: 'day' },
      { amount: 4.34524, name: 'week' },
      { amount: 12, name: 'month' },
      { amount: Number.POSITIVE_INFINITY, name: 'year' },
    ];

    let duration = seconds;
    for (const division of divisions) {
      if (Math.abs(duration) < division.amount) {
        return new Intl.RelativeTimeFormat('id-ID', {
          numeric: 'auto',
        }).format(Math.round(duration), division.name);
      }
      duration /= division.amount;
    }

    return '';
  };

  return (
    <>
      <BulkTrashActionsToolbar
        selectedCount={selectedCount}
        selectedIds={selectedArray}
        onClearSelection={clearSelection}
        entityType="pengguna"
        userRole={userRole}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600">
        <div className="overflow-auto max-h-[60vh] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 w-10">
                  {isSuperAdmin ? (
                    <div className={`relative inline-block p-0.5 rounded transition-all duration-200 ${
                      allSelected || someSelected ? 'bg-indigo-100 dark:bg-indigo-800/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) {
                            el.indeterminate = someSelected;
                          }
                        }}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-indigo-600 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-indigo-600 cursor-pointer transition-all duration-200 checked:border-indigo-600 dark:checked:border-indigo-500 checked:bg-indigo-600 dark:checked:bg-indigo-600"
                        aria-label="Pilih semua pengguna di halaman ini"
                      />
                    </div>
                  ) : (
                    <div className="text-xs text-gray-300 dark:text-gray-600">—</div>
                  )}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Pengguna
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Peran
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Tanggal Dihapus
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentPageData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                      <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center">
                        <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">Tidak ada akun pengguna di kotak sampah.</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Penghapusan akun hanya boleh dilakukan untuk operator yang tidak lagi aktif dalam sistem.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentPageData.map((user) => (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 ${
                      selectedIds.has(user.id) ? 'bg-indigo-100 dark:bg-indigo-900/30 border-l-4 border-indigo-600 dark:border-indigo-400' : ''
                    }`}
                  >
                    <td className="px-3 py-4 text-center">
                      {isSuperAdmin ? (
                        <div className={`relative inline-block p-0.5 rounded transition-all duration-200 ${
                          selectedIds.has(user.id) ? 'bg-indigo-100 dark:bg-indigo-800/50' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(user.id)}
                            onChange={() => toggleSelect(user.id)}
                            className="w-4 h-4 text-indigo-600 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-indigo-600 cursor-pointer transition-all duration-200 checked:border-indigo-600 dark:checked:border-indigo-500 checked:bg-indigo-600 dark:checked:bg-indigo-600"
                            aria-label={`Pilih pengguna ${user.nama}`}
                          />
                        </div>
                      ) : (
                        <div className="text-xs text-gray-300 dark:text-gray-600">—</div>
                      )}
                    </td>
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
                          <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {(() => {
                        const normalizedRole = user.role as string;
                        const isSuperAdmin = normalizedRole === 'SUPER_ADMIN';
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
                      <p className="font-medium text-gray-900 dark:text-white">{formatDateTime(user.deletedAt)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatRelativeTime(user.deletedAt)}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <TrashActionButtons
                        entityId={user.id}
                        entityType="pengguna"
                        entityName={user.nama}
                        userRole={userRole}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            firstItemIndex={firstItemIndex}
            lastItemIndex={lastItemIndex}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>
    </>
  );
}
