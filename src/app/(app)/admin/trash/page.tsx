// file: app/(app)/admin/trash/page.tsx

import Image from 'next/image';
import TrashActionButtons from '@/app/components/TrashActionButtons';
import LiveDateTime from '@/app/components/LiveDateTime';
import { purgeExpiredSuratTrash } from '@/app/(app)/admin/actions';
import { prisma } from '@/lib/prisma';
import { SURAT_TRASH_RETENTION_DAYS } from '@/lib/trashRetention';
import { Clock, FileText, ShieldAlert, Trash2, Users } from 'lucide-react';

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'full',
  timeStyle: 'short',
});

const relativeTimeFormatter = new Intl.RelativeTimeFormat('id-ID', {
  numeric: 'auto',
});

function formatDateTime(date: Date | null | undefined) {
  if (!date) return '—';
  return dateFormatter.format(date);
}

function formatRelativeTime(date: Date | null | undefined) {
  if (!date) return '';

  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
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
      return relativeTimeFormatter.format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }

  return '';
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

export default async function TrashPage() {
  const { purged } = await purgeExpiredSuratTrash();
  const [deletedSuratList, deletedUsers] = await Promise.all([
    prisma.surat.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
      select: {
        id: true,
        perihal: true,
        nomor_surat: true,
        asal_surat: true,
        tujuan_surat: true,
        deletedAt: true,
      },
    }),
    prisma.pengguna.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: 'desc' },
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        profilePictureUrl: true,
        deletedAt: true,
      },
    }),
  ]);

  const totalSurat = deletedSuratList.length;
  const totalUsers = deletedUsers.length;
  const totalItems = totalSurat + totalUsers;

  const latestDeletedAt = [...deletedSuratList, ...deletedUsers]
    .map((item) => item.deletedAt)
    .filter((value): value is Date => Boolean(value))
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null;

  const lastDeletedDisplay = latestDeletedAt
    ? `${formatDateTime(latestDeletedAt)} • ${formatRelativeTime(latestDeletedAt)}`
    : 'Belum ada data terhapus';

  const summaryCards = [
    {
      label: 'Surat Terhapus',
      value: totalSurat.toLocaleString('id-ID'),
      icon: FileText,
  description: `Arsip surat yang siap dipulihkan. Retensi otomatis ${SURAT_TRASH_RETENTION_DAYS} hari.`,
    },
    {
      label: 'Akun Terhapus',
      value: totalUsers.toLocaleString('id-ID'),
      icon: Users,
      description: 'Akun operator yang dinonaktifkan.',
    },
    {
      label: 'Total Item',
      value: totalItems.toLocaleString('id-ID'),
      icon: Trash2,
      description: 'Jumlah semua record di tempat sampah.',
    },
    {
      label: 'Terakhir Diperbarui',
      value: lastDeletedDisplay,
      icon: Clock,
      description: 'Jejak aktivitas penghapusan terbaru.',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Kotak Sampah</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kelola item yang dihapus sementara. Pulihkan atau hapus permanen sesuai kebutuhan.
          </p>
        </div>
        <LiveDateTime />
      </div>

      {purged > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-emerald-200 dark:border-emerald-700 p-4 transition-all duration-300 hover:shadow-md animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg w-10 h-10 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900 dark:text-emerald-100">Pembersihan Otomatis Berhasil</p>
              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                {purged.toLocaleString('id-ID')} surat dihapus permanen karena melebihi periode retensi
                {` ${SURAT_TRASH_RETENTION_DAYS} hari.`}
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{card.value}</p>
                </div>
                <div className="flex-shrink-0 bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50 dark:from-indigo-900/30 dark:via-sky-900/30 dark:to-emerald-900/30 rounded-full p-3">
                  <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.description}</p>
            </div>
          );
        })}
      </section>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-amber-200 dark:border-amber-700 p-5 transition-all duration-300 hover:shadow-md">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/30 rounded-lg w-10 h-10 flex items-center justify-center">
            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-900 dark:text-amber-100">Catatan Keamanan</p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
              Penghapusan permanen akan menghapus data dari server termasuk lampiran terkait. Pastikan sudah melakukan
              audit sebelum mengeksekusi aksi destruktif ini. Sistem akan menghapus otomatis surat yang tidak dipulihkan dalam
              {` ${SURAT_TRASH_RETENTION_DAYS} hari.`}
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Sampah Surat</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Daftar surat yang dihapus sementara dan dapat dipulihkan kapan saja.</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700">
            {totalSurat.toLocaleString('id-ID')} item
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Detail Surat
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Asal & Tujuan
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
                {deletedSuratList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                        <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center">
                          <FileText className="h-8 w-8 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                        </div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Tidak ada surat di kotak sampah.</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Surat yang dihapus akan muncul di sini selama periode retensi sebelum dihapus permanen.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  deletedSuratList.map((surat) => (
                    <tr key={surat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <p className="font-semibold text-gray-900 dark:text-white">{surat.perihal}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Nomor: {surat.nomor_surat}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <p className="font-medium text-gray-900 dark:text-white">{surat.asal_surat}</p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">→ {surat.tujuan_surat}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <p className="font-medium text-gray-900 dark:text-white">{formatDateTime(surat.deletedAt)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatRelativeTime(surat.deletedAt)}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <TrashActionButtons
                          entityId={surat.id}
                          entityType="surat"
                          entityName={surat.perihal}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Sampah Akun Pengguna</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kelola akun operator yang telah dinonaktifkan. Pulihkan atau hapus permanen sesuai kebutuhan.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700">
            {totalUsers.toLocaleString('id-ID')} akun
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
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
                {deletedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                        <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center">
                          <Users className="h-8 w-8 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                        </div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">Tidak ada akun pengguna di kotak sampah.</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Penghapusan akun hanya boleh dilakukan untuk operator yang tidak lagi aktif dalam sistem.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  deletedUsers.map((user) => (
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
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}