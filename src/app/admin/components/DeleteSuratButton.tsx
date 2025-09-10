// file: app/admin/components/DeleteSuratButton.tsx
'use client';

import { useState, useTransition } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { deleteSurat } from '../actions';
import toast from 'react-hot-toast';

type Props = {
  suratId: string;
};

export default function DeleteSuratButton({ suratId }: Props) {
  let [isOpen, setIsOpen] = useState(false);
  let [isPending, startTransition] = useTransition();

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSurat(suratId);
      if (result?.message.includes('Gagal')) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
        closeModal();
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="text-red-600 hover:text-red-900 text-sm font-medium"
      >
        Hapus
      </button>

      <Transition appear show={isOpen}>
        <Dialog as="div" className="relative z-10 focus:outline-none" onClose={closeModal}>
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6">
                  <DialogTitle as="h3" className="text-lg font-medium text-gray-900">
                    Konfirmasi Penghapusan
                  </DialogTitle>
                  <p className="mt-2 text-sm text-gray-500">
                    Apakah Anda yakin ingin menghapus surat ini? Aksi ini tidak dapat dibatalkan.
                  </p>
                  <div className="mt-4 flex justify-end gap-4">
                    <button
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      onClick={closeModal}
                    >
                      Batal
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-red-300"
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