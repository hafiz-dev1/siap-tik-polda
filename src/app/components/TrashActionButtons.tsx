// file: app/components/TrashActionButtons.tsx
'use client';

import { useState, useTransition, Fragment, ReactNode } from 'react';
import { deleteSuratPermanently, deleteUserPermanently, restoreSurat, restoreUser } from '@/app/(app)/admin/actions';
import toast from 'react-hot-toast';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';

type Props = {
  entityId: string;
  entityType: 'surat' | 'pengguna';
  entityName?: string;
  userRole?: string; // Role user yang sedang login
};

export default function TrashActionButtons({ entityId, entityType, entityName, userRole }: Props) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const entityLabel = entityType === 'surat' ? 'surat' : 'akun pengguna';
  const entityLabelCapitalized = entityLabel
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  const entityIdentifier = entityName ? ` "${entityName}"` : '';

  // Cek apakah user adalah SUPER_ADMIN
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  
  // Untuk pengguna, hanya SUPER_ADMIN yang bisa restore/delete
  const canManageUsers = entityType === 'pengguna' ? isSuperAdmin : true;

  // Handler untuk memulihkan surat
  const handleRestore = () => {
    startTransition(async () => {
      const result = entityType === 'surat'
        ? await restoreSurat(entityId)
        : await restoreUser(entityId);

      if ("error" in result) {
        toast.error(result.error ?? `Terjadi kesalahan saat memulihkan ${entityLabel}.`);
      } else {
        toast.success(result.success ?? `${entityLabelCapitalized} berhasil dipulihkan.`);
      }

      setIsRestoreModalOpen(false);
    });
  };

  // Handler untuk menghapus surat secara permanen
  const handleDelete = () => {
    startTransition(async () => {
      const result = entityType === 'surat'
        ? await deleteSuratPermanently(entityId)
        : await deleteUserPermanently(entityId);

      if ("error" in result) {
        toast.error(result.error ?? `Terjadi kesalahan saat menghapus ${entityLabel}.`);
      } else {
        toast.success(result.success ?? `${entityLabelCapitalized} berhasil dihapus permanen.`);
      }

      setIsDeleteModalOpen(false);
    });
  };

  // Jika user tidak punya akses untuk manage users, tampilkan pesan
  if (!canManageUsers) {
    return (
      <div className="text-xs text-gray-400 dark:text-gray-500 italic">
        Hanya Super Admin
      </div>
    );
  }

  return (
    <div className="flex space-x-4">
      {/* Tombol Pulihkan */}
      <button
        onClick={() => setIsRestoreModalOpen(true)}
        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium cursor-pointer"
      >
        Pulihkan
      </button>

      {/* Tombol Hapus Permanen */}
      <button
        onClick={() => setIsDeleteModalOpen(true)}
        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium cursor-pointer"
      >
        Hapus Permanen
      </button>

      {/* Modal Konfirmasi untuk Aksi Pulihkan */}
      <ModalTemplate
        isOpen={isRestoreModalOpen}
        closeModal={() => setIsRestoreModalOpen(false)}
        title={`Konfirmasi Pemulihan ${entityLabelCapitalized}`}
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Apakah Anda yakin ingin memulihkan {entityLabel}
          {entityIdentifier} ke data utama?
        </p>
        <div className="mt-4 flex justify-end gap-4">
          <button
            onClick={() => setIsRestoreModalOpen(false)}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-md"
          >
            Batal
          </button>
          <button
            onClick={handleRestore}
            disabled={isPending}
            className="px-4 py-2 text-sm text-white bg-green-600 rounded-md disabled:bg-green-300"
          >
            {isPending ? 'Memulihkan...' : 'Ya, Pulihkan'}
          </button>
        </div>
      </ModalTemplate>

      {/* Modal Konfirmasi untuk Aksi Hapus Permanen */}
      <ModalTemplate
        isOpen={isDeleteModalOpen}
        closeModal={() => setIsDeleteModalOpen(false)}
        title={`Konfirmasi Hapus Permanen ${entityLabelCapitalized}`}
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-bold text-red-600 dark:text-red-400">PERINGATAN:</span>
          Aksi ini tidak dapat dibatalkan. Data {entityLabel}
          {entityIdentifier} akan hilang selamanya. Apakah Anda benar-benar yakin?
        </p>
        <div className="mt-4 flex justify-end gap-4">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-md"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-md disabled:bg-red-300"
          >
            {isPending ? 'Menghapus...' : 'Ya, Hapus Permanen'}
          </button>
        </div>
      </ModalTemplate>
    </div>
  );
}

// Komponen helper internal untuk struktur Modal
function ModalTemplate({
  isOpen,
  closeModal,
  title,
  children
}: {
  isOpen: boolean;
  closeModal: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10 focus:outline-none" onClose={closeModal}>
        <div className="fixed inset-0 bg-black/30 dark:bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium text-gray-900 dark:text-white"
                >
                  {title}
                </DialogTitle>
                <div className="mt-2">{children}</div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
