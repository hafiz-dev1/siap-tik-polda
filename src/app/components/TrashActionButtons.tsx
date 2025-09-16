// file: app/components/TrashActionButtons.tsx
'use client';

import { useState, useTransition, Fragment, MouseEvent } from 'react';
import { deleteSuratPermanently, restoreSurat } from '@/app/(app)/admin/actions';
import toast from 'react-hot-toast';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';

type Props = {
  suratId: string;
};

export default function TrashActionButtons({ suratId }: Props) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  let [isPending, startTransition] = useTransition();

  const handleRestore = () => {
    startTransition(async () => {
      const result = await restoreSurat(suratId);
      if (result.message.includes('Gagal')) toast.error(result.message);
      else toast.success(result.message);
      setIsRestoreModalOpen(false);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSuratPermanently(suratId);
      if (result.message.includes('Gagal')) toast.error(result.message);
      else toast.success(result.message);
      setIsDeleteModalOpen(false);
    });
  };

  return (
    <div className="flex space-x-4">
      {/* Tombol Pulihkan */}
      <button 
        onClick={() => setIsRestoreModalOpen(true)}
        className="text-green-600 hover:text-green-900 text-sm font-medium"
      >
        Pulihkan
      </button>

      {/* Tombol Hapus Permanen */}
      <button 
        onClick={() => setIsDeleteModalOpen(true)}
        className="text-red-600 hover:text-red-900 text-sm font-medium"
      >
        Hapus Permanen
      </button>

      {/* Modal Konfirmasi Pulihkan */}
      <ModalTemplate isOpen={isRestoreModalOpen} closeModal={() => setIsRestoreModalOpen(false)} title="Konfirmasi Pemulihan">
        <p className="text-sm text-gray-500">Apakah Anda yakin ingin memulihkan surat ini ke arsip utama?</p>
        <div className="mt-4 flex justify-end gap-4">
          <button onClick={() => setIsRestoreModalOpen(false)} className="px-4 py-2 text-sm bg-gray-100 rounded-md">Batal</button>
          <button onClick={handleRestore} disabled={isPending} className="px-4 py-2 text-sm text-white bg-green-600 rounded-md disabled:bg-green-300">
            {isPending ? 'Memulihkan...' : 'Ya, Pulihkan'}
          </button>
        </div>
      </ModalTemplate>

      {/* Modal Konfirmasi Hapus Permanen */}
      <ModalTemplate isOpen={isDeleteModalOpen} closeModal={() => setIsDeleteModalOpen(false)} title="Konfirmasi Hapus Permanen">
        <p className="text-sm text-gray-500">PERINGATAN: Aksi ini tidak dapat dibatalkan. Data surat dan file yang terlampir akan hilang selamanya. Apakah Anda benar-benar yakin?</p>
        <div className="mt-4 flex justify-end gap-4">
          <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm bg-gray-100 rounded-md">Batal</button>
          <button onClick={handleDelete} disabled={isPending} className="px-4 py-2 text-sm text-white bg-red-600 rounded-md disabled:bg-red-300">
            {isPending ? 'Menghapus...' : 'Ya, Hapus Permanen'}
          </button>
        </div>
      </ModalTemplate>
    </div>
  );
}

// Komponen helper internal untuk Modal
function ModalTemplate({ isOpen, closeModal, title, children }: { isOpen: boolean, closeModal: () => void, title: string, children: React.ReactNode }) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <DialogTitle as="h3" className="text-lg font-medium text-gray-900">{title}</DialogTitle>
                <div className="mt-2">{children}</div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}