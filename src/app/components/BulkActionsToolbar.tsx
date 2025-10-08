'use client';

import { useState, useTransition, Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { deleteBulkSurat } from '@/app/(app)/admin/actions';
import toast from 'react-hot-toast';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  selectedIds: string[];
}

export default function BulkActionsToolbar({
  selectedCount,
  onClearSelection,
  selectedIds,
}: BulkActionsToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleBulkDelete = () => {
    startTransition(async () => {
      const result = await deleteBulkSurat(selectedIds);
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(result.success);
        setIsOpen(false);
        onClearSelection();
      }
    });
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="sticky top-0 z-20 bg-indigo-50 dark:bg-indigo-900/30 border-b border-indigo-200 dark:border-indigo-800 px-6 py-3 rounded-t-lg animate-in slide-in-from-top duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-gray-900 dark:text-white">
                {selectedCount} surat dipilih
              </span>
            </div>
            <button
              onClick={onClearSelection}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors cursor-pointer hover:underline"
            >
              Batal Pilih
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.576 0h12.576" />
              </svg>
              Hapus {selectedCount} Surat
            </button>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 focus:outline-none" onClose={() => setIsOpen(false)}>
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
                  <DialogTitle as="h3" className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    Konfirmasi Hapus Multiple
                  </DialogTitle>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                    Anda akan menghapus <strong className="font-semibold text-gray-900 dark:text-white">{selectedCount} surat</strong> sekaligus.
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Surat-surat ini akan dipindahkan ke tempat sampah dan dapat dipulihkan dalam waktu tertentu.
                  </p>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none transition-all duration-200 cursor-pointer hover:shadow-sm active:scale-95"
                      onClick={() => setIsOpen(false)}
                      disabled={isPending}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none disabled:bg-red-400 dark:disabled:bg-red-800 transition-all duration-200 cursor-pointer hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:active:scale-100"
                      onClick={handleBulkDelete}
                      disabled={isPending}
                    >
                      {isPending ? 'Menghapus...' : `Ya, Hapus ${selectedCount} Surat`}
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
