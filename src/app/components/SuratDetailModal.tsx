// file: app/components/SuratDetailModal.tsx
'use client';

import { useState, Fragment, ReactNode, cloneElement, MouseEvent } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Surat, Lampiran } from '@prisma/client';

// Tipe props yang diterima, termasuk data lampiran yang terhubung
type Props = {
  surat: (Surat & { lampiran: Lampiran[] });
  children: ReactNode; // 'children' akan menjadi baris tabel (<tr>) yang menjadi pemicu
};

export default function SuratDetailModal({ surat, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);
  
  // Fungsi helper untuk memformat teks enum agar mudah dibaca
  const formatEnumText = (text: string) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Fungsi untuk memformat tujuan disposisi dengan nama lengkap
  const formatDispositionTarget = (target: string) => {
    const targetMap: Record<string, string> = {
      'KASUBBID_TEKKOM': 'KASUBBID TEKKOM',
      'KASUBBID_TEKINFO': 'KASUBBID TEKINFO',
      'KASUBBAG_RENMIN': 'KASUBBAG RENMIN',
      'KAUR_KEU': 'KAUR KEU'
    };
    return targetMap[target] || formatEnumText(target);
  };

  // Fungsi untuk mendapatkan warna tag sesuai tujuan disposisi
  const getTagColor = (target: string) => {
    const colorMap: Record<string, string> = {
      'KASUBBID_TEKKOM': 'bg-blue-25 dark:bg-blue-900/15 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30',
      'KASUBBID_TEKINFO': 'bg-emerald-25 dark:bg-emerald-900/15 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30',
      'KASUBBAG_RENMIN': 'bg-purple-25 dark:bg-purple-900/15 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/30',
      'KAUR_KEU': 'bg-rose-25 dark:bg-rose-900/15 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/30'
    };
    return colorMap[target] || 'bg-indigo-25 dark:bg-indigo-900/15 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/30';
  };

  // Clone the children and add onClick handler directly to the <tr> element
  const clonedChildren = cloneElement(children as React.ReactElement<any>, {
    onClick: (e: MouseEvent<HTMLTableRowElement>) => {
      e.preventDefault();
      openModal();
    },
    style: { cursor: 'pointer' }
  });

  return (
    <>
      {/* Return the cloned children with click handler directly attached */}
      {clonedChildren}

      {/* Modal Dialog */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 focus:outline-none" onClose={closeModal}>
          {/* Latar belakang overlay */}
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
                <DialogPanel className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl">
                  <DialogTitle as="h3" className="text-xl font-bold leading-6 text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2 mb-4">
                    Detail Surat & Disposisi
                  </DialogTitle>
                  
                  <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-3 text-sm">
                    {/* Detail Utama - 2 Kolom */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                      <div>
                        <strong className="text-gray-400 dark:text-gray-500 block mb-1">Nomor Agenda:</strong>
                        <p className="text-gray-200 dark:text-gray-300">{surat.nomor_agenda}</p>
                      </div>
                      <div>
                        <strong className="text-gray-400 dark:text-gray-500 block mb-1">Nomor Surat:</strong>
                        <p className="text-gray-200 dark:text-gray-300">{surat.nomor_surat}</p>
                      </div>
                      <div>
                        <strong className="text-gray-400 dark:text-gray-500 block mb-1">Tanggal Surat:</strong>
                        <p className="text-gray-200 dark:text-gray-300">{new Date(surat.tanggal_surat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <strong className="text-gray-400 dark:text-gray-500 block mb-1">Tanggal Diterima:</strong>
                        <p className="text-gray-200 dark:text-gray-300">{new Date(surat.tanggal_diterima_dibuat).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} pukul {new Date(surat.tanggal_diterima_dibuat).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</p>
                      </div>
                      <div>
                        <strong className="text-gray-400 dark:text-gray-500 block mb-1">Asal Surat:</strong>
                        <p className="text-gray-200 dark:text-gray-300">{surat.asal_surat}</p>
                      </div>
                      <div>
                        <strong className="text-gray-400 dark:text-gray-500 block mb-1">Tujuan Surat:</strong>
                        <p className="text-gray-200 dark:text-gray-300">{surat.tujuan_surat}</p>
                      </div>
                      <div>
                        <strong className="text-gray-400 dark:text-gray-500 block mb-1">Arah:</strong>
                        <p className="text-gray-200 dark:text-gray-300">{formatEnumText(surat.arah_surat)}</p>
                      </div>
                      <div>
                        <strong className="text-gray-400 dark:text-gray-500 block mb-1">Tipe Dokumen:</strong>
                        <p className="text-gray-200 dark:text-gray-300">{formatEnumText(surat.tipe_dokumen)}</p>
                      </div>
                    </div>
                    
                    {/* Detail Perihal */}
                    <div>
                        <strong className="text-gray-400 dark:text-gray-500 block mb-1">Perihal:</strong>
                        <p className="text-gray-200 dark:text-gray-300 whitespace-pre-wrap">{surat.perihal}</p>
                    </div>

                    {/* Detail Tujuan Disposisi */}
                     <div>
                        <strong className="text-gray-400 dark:text-gray-500 block mb-1">Tujuan Disposisi:</strong>
                        <div className="flex flex-wrap gap-2">
                            {surat.tujuan_disposisi.map((tujuan: string) => (
                                <span key={tujuan} className={`px-2 py-1 text-xs rounded-sm ${getTagColor(tujuan)}`}>{formatDispositionTarget(tujuan)}</span>
                            ))}
                        </div>
                     </div>

                    {/* Detail Isi Disposisi */}
                    <div>
                        <strong className="text-gray-400 dark:text-gray-500 block mb-1">Isi Disposisi:</strong>
                        <div className="bg-gray-700 dark:bg-gray-700/50 p-3 rounded border border-gray-600 dark:border-gray-600">
                          <p className="text-gray-200 dark:text-gray-300 whitespace-pre-wrap">{surat.isi_disposisi}</p>
                        </div>
                    </div>

                    {/* Link Download */}
                    <div>
                        <strong className="text-gray-400 dark:text-gray-500 block mb-1">Lampiran:</strong>
                        <div>
                           {surat.lampiran[0] ? (
                            <button 
                              onClick={() => window.open(surat.lampiran[0].path_file, '_blank')}
                              className="text-blue-400 hover:underline dark:text-blue-400 dark:hover:text-blue-300 text-sm cursor-pointer bg-transparent border-none p-0"
                            >
                              {surat.lampiran[0].nama_file}
                            </button>
                          ) : (
                            <p className="text-gray-400 dark:text-gray-500">Tidak ada file terlampir.</p>
                          )}
                        </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-4 border-t dark:border-gray-700 pt-4">
                    <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 cursor-pointer" onClick={closeModal}>
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