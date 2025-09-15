// file: app/admin/components/SuratDetailModal.tsx
'use client';

import { useState, Fragment, ReactNode } from 'react';
import { Dialog, Transition, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react';
import { SuratType } from '../types';
import { Lampiran } from '@prisma/client';

type Props = {
  surat: SuratType & { lampiran: Lampiran[] }; // Tipe data surat beserta lampirannya
  children: ReactNode; // 'children' akan menjadi baris tabel (<tr>)
};

export default function SuratDetailModal({ surat, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);
  const formatEnumText = (text: string) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <>
      {/* Kita bungkus children (<tr>) dengan div agar bisa di-klik */}
      <div onClick={openModal} className="contents cursor-pointer">
        {children}
      </div>

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
                <DialogPanel className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
                  <DialogTitle as="h3" className="text-xl font-bold leading-6 text-gray-900 border-b pb-2">
                    Detail Surat
                  </DialogTitle>
                  <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Perihal:</strong><p>{surat.perihal}</p></div>
                      <div><strong>Nomor Agenda:</strong><p>{surat.nomor_agenda}</p></div>
                      <div><strong>Nomor Surat:</strong><p>{surat.nomor_surat}</p></div>
                      <div><strong>Tanggal Surat:</strong><p>{new Date(surat.tanggal_surat).toLocaleDateString('id-ID')}</p></div>
                      <div><strong>Asal Surat:</strong><p>{surat.asal_surat}</p></div>
                      <div><strong>Tujuan Surat:</strong><p>{surat.tujuan_surat}</p></div>
                      <div><strong>Tanggal Diterima:</strong><p>{new Date(surat.tanggal_diterima_dibuat).toLocaleString('id-ID')}</p></div>
                      <div><strong>Tipe Dokumen:</strong><p>{formatEnumText(surat.tipe_dokumen)}</p></div>
                    </div>
                     <div><strong>Tujuan Disposisi:</strong>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {surat.tujuan_disposisi.map(tujuan => (
                                <span key={tujuan} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{formatEnumText(tujuan)}</span>
                            ))}
                        </div>
                     </div>
                    <div><strong>Isi Disposisi:</strong><p className="whitespace-pre-wrap bg-gray-50 p-2 rounded-md">{surat.isi_disposisi}</p></div>
                  </div>
                  <div className="mt-6 flex justify-end gap-4 border-t pt-4">
                    <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200" onClick={closeModal}>
                      Tutup
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