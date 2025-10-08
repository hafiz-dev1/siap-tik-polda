'use client';

import { Fragment, memo } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Surat, Lampiran } from '@prisma/client';

type SuratWithLampiran = Surat & { lampiran: Lampiran[] };

interface OptimizedSuratDetailModalProps {
  isOpen: boolean;
  surat: SuratWithLampiran | null;
  onClose: () => void;
  formatEnumText: (text: string) => string;
  formatDispositionTarget: (target: string) => string;
  getTagColor: (target: string) => string;
}

const OptimizedSuratDetailModal = memo(function OptimizedSuratDetailModal({
  isOpen,
  surat,
  onClose,
  formatEnumText,
  formatDispositionTarget,
  getTagColor,
}: OptimizedSuratDetailModalProps) {
  if (!surat) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Animated backdrop overlay */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 dark:bg-black/40" aria-hidden="true" />
        </TransitionChild>
        
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-250"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-2xl transition-all border dark:border-gray-700">
                <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                  Detail Surat {surat.arah_surat === 'MASUK' ? 'Masuk' : 'Keluar'}
                </DialogTitle>

                <div className="max-h-[70vh] overflow-y-auto space-y-3 text-sm">
                  {/* Detail Utama - 2 Kolom */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    {/* Nomor Agenda */}
                    <div>
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">Nomor Agenda:</span>
                      <p className="text-gray-200 dark:text-gray-300">{surat.nomor_agenda}</p>
                    </div>

                    {/* Nomor Surat */}
                    <div>
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">Nomor Surat:</span>
                      <p className="text-gray-200 dark:text-gray-300">{surat.nomor_surat}</p>
                    </div>

                    {/* Tanggal Surat */}
                    <div>
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">Tanggal Surat:</span>
                      <p className="text-gray-200 dark:text-gray-300">
                        {new Date(surat.tanggal_surat).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Tanggal Diterima/Dibuat */}
                    <div>
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">
                        Tanggal {surat.arah_surat === 'MASUK' ? 'Diterima' : 'Dibuat'}:
                      </span>
                      <p className="text-gray-200 dark:text-gray-300">
                        {new Date(surat.tanggal_diterima_dibuat).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })} pukul {new Date(surat.tanggal_diterima_dibuat).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} WIB
                      </p>
                    </div>

                    {/* Asal Surat */}
                    <div>
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">
                        {surat.arah_surat === 'MASUK' ? 'Asal Surat' : 'Dari'}:
                      </span>
                      <p className="text-gray-200 dark:text-gray-300">{surat.asal_surat}</p>
                    </div>

                    {/* Tujuan Surat */}
                    <div>
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">
                        {surat.arah_surat === 'MASUK' ? 'Kepada' : 'Tujuan Surat'}:
                      </span>
                      <p className="text-gray-200 dark:text-gray-300">{surat.tujuan_surat}</p>
                    </div>

                    {/* Arah */}
                    <div>
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">Arah:</span>
                      <p className="text-gray-200 dark:text-gray-300">{formatEnumText(surat.arah_surat)}</p>
                    </div>

                    {/* Tipe Dokumen */}
                    <div>
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">Tipe Dokumen:</span>
                      <p className="text-gray-200 dark:text-gray-300">{formatEnumText(surat.tipe_dokumen)}</p>
                    </div>
                  </div>

                  {/* Perihal */}
                  <div>
                    <span className="text-gray-400 dark:text-gray-500 block mb-1">Perihal:</span>
                    <p className="text-gray-200 dark:text-gray-300 whitespace-pre-wrap">{surat.perihal}</p>
                  </div>

                  {/* Tujuan Disposisi */}
                  <div>
                    <span className="text-gray-400 dark:text-gray-500 block mb-1">Tujuan Disposisi:</span>
                    <div className="flex flex-wrap gap-2">
                      {surat.tujuan_disposisi.map((tujuan) => (
                        <span
                          key={tujuan}
                          className={`px-2 py-1 text-xs rounded-sm ${getTagColor(tujuan)}`}
                          title={formatDispositionTarget(tujuan)}
                        >
                          {formatDispositionTarget(tujuan)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Isi Disposisi */}
                  <div>
                    <span className="text-gray-400 dark:text-gray-500 block mb-1">Isi Disposisi:</span>
                    <div className="bg-gray-700 dark:bg-gray-700/50 p-3 rounded border border-gray-600 dark:border-gray-600">
                      <p className="text-gray-200 dark:text-gray-300 whitespace-pre-wrap">{surat.isi_disposisi}</p>
                    </div>
                  </div>

                  {/* Lampiran */}
                  {surat.lampiran.length > 0 && (
                    <div>
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">Lampiran:</span>
                      <div className="space-y-2">
                        {surat.lampiran.map((lampiran) => (
                          <button
                            key={lampiran.id}
                            onClick={() => window.open(lampiran.path_file, '_blank')}
                            className="text-blue-400 hover:underline dark:text-blue-400 dark:hover:text-blue-300 text-sm cursor-pointer bg-transparent border-none p-0 block"
                          >
                            {lampiran.nama_file}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});

export default OptimizedSuratDetailModal;