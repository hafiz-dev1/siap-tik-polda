// file: app/admin/components/DeleteSuratButton.tsx
'use client';

import { useState, useTransition, MouseEvent, Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { deleteSurat } from '../actions';
import toast from 'react-hot-toast';

// The component accepts the ID of the letter to be deleted as a prop.
type Props = {
  suratId: string;
};

export default function DeleteSuratButton({ suratId }: Props) {
  // State to manage whether the confirmation modal is open or closed.
  let [isOpen, setIsOpen] = useState(false);
  
  // useTransition hook to track the pending state of the server action.
  // This helps provide user feedback (e.g., "Menghapus...") without blocking the UI.
  let [isPending, startTransition] = useTransition();

  function closeModal() {
    setIsOpen(false);
  }

  // The click event is passed to stop it from bubbling up to the table row.
  function openModal(e: MouseEvent) {
    e.stopPropagation(); // Prevents the detail modal from opening simultaneously.
    setIsOpen(true);
  }

  // This function is called when the user confirms the deletion.
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
      {/* The initial "Hapus" button shown in the table row. */}
      <button
        type="button"
        onClick={openModal}
        className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors duration-200"
      >
        Hapus
      </button>

      {/* The confirmation modal that appears when the button is clicked. */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10 focus:outline-none" onClose={closeModal}>
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
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
                <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                  <DialogTitle as="h3" className="text-lg font-medium text-gray-900">
                    Konfirmasi Penghapusan
                  </DialogTitle>
                  <p className="mt-2 text-sm text-gray-500">
                    Apakah Anda yakin ingin menghapus arsip surat ini? Aksi ini akan memindahkan data ke arsip yang terhapus.
                  </p>
                  <div className="mt-6 flex justify-end gap-4">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
                      onClick={closeModal}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none disabled:bg-red-300"
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