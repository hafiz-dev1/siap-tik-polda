// file: app/components/DeleteUserButton.tsx
'use client';

import { useState, useTransition, MouseEvent, Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { deleteUser } from '@/app/(app)/admin/users/actions'; // <-- Impor dari actions pengguna
import toast from 'react-hot-toast';

type Props = {
  userId: string;
};

export default function DeleteUserButton({ userId }: Props) {
  let [isOpen, setIsOpen] = useState(false);
  let [isPending, startTransition] = useTransition();

  function closeModal() { setIsOpen(false); }
  function openModal(e: MouseEvent) {
    e.stopPropagation();
    setIsOpen(true);
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteUser(userId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success || 'Pengguna dihapus.');
        closeModal();
      }
    });
  };

  return (
    <>
      <button onClick={openModal} className="text-red-600 hover:text-red-900 text-sm font-medium">
        Hapus
      </button>

      {/* Modal Konfirmasi */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                  <DialogTitle as="h3" className="text-lg font-medium">Konfirmasi Penghapusan</DialogTitle>
                  <p className="mt-2 text-sm text-gray-500">Apakah Anda yakin ingin menghapus pengguna ini?</p>
                  <div className="mt-6 flex justify-end gap-4">
                    <button type="button" className="px-4 py-2 text-sm bg-gray-100 rounded-md" onClick={closeModal}>Batal</button>
                    <button type="button" onClick={handleDelete} disabled={isPending} className="px-4 py-2 text-sm text-white bg-red-600 rounded-md disabled:bg-red-300">
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