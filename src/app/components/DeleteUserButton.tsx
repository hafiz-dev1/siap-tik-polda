// file: app/components/DeleteUserButton.tsx
'use client';

import { useState, useTransition, MouseEvent, Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { deleteUser } from '@/app/(app)/admin/users/actions'; // Menggunakan path alias yang benar
import toast from 'react-hot-toast';

// Komponen menerima ID pengguna yang akan dihapus sebagai prop
type Props = {
  userId: string;
};

export default function DeleteUserButton({ userId }: Props) {
  // State untuk mengelola visibilitas modal konfirmasi
  let [isOpen, setIsOpen] = useState(false);
  
  // Hook useTransition untuk melacak status pending dari server action
  let [isPending, startTransition] = useTransition();

  function closeModal() {
    setIsOpen(false);
  }

  // Event klik diteruskan untuk menghentikan propagasinya ke baris tabel (<tr>)
  function openModal(e: MouseEvent) {
    e.stopPropagation(); // Mencegah modal lain terbuka secara bersamaan
    setIsOpen(true);
  }

  // Fungsi ini dipanggil ketika pengguna mengonfirmasi penghapusan
  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteUser(userId);
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(result.success);
        closeModal();
      }
    });
  };

  return (
    <>
      {/* Tombol "Hapus" awal yang ditampilkan di baris tabel */}
      <button
        type="button"
        onClick={openModal}
        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium transition-colors duration-200 cursor-pointer"
      >
        Hapus
      </button>

      {/* Modal konfirmasi yang muncul saat tombol diklik */}
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
                  <DialogTitle as="h3" className="text-lg font-medium text-gray-900 dark:text-white">
                    Konfirmasi Penghapusan Pengguna
                  </DialogTitle>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Apakah Anda yakin ingin menghapus pengguna ini? Aksi ini akan memindahkan akun ke arsip yang terhapus.
                  </p>
                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none"
                      onClick={closeModal}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none disabled:bg-red-300 dark:disabled:bg-red-800"
                      onClick={handleDelete}
                      disabled={isPending}
                    >
                      {isPending ? 'Menghapus...' : 'Ya, Hapus'}
                    </button>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
