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
  getTagColor: (target: string) => string;
}

const OptimizedSuratDetailModal = memo(function OptimizedSuratDetailModal({
  isOpen,
  surat,
  onClose,
  formatEnumText,
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* Nomor Agenda */}
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Nomor Agenda:</span>
                    <p className="text-gray-900 dark:text-gray-100">{surat.nomor_agenda}</p>
                  </div>

                  {/* Nomor Surat */}
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Nomor Surat:</span>
                    <p className="text-gray-900 dark:text-gray-100">{surat.nomor_surat}</p>
                  </div>

                  {/* Tanggal Surat */}
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Tanggal Surat:</span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {new Date(surat.tanggal_surat).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Tanggal Diterima/Dibuat */}
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Tanggal {surat.arah_surat === 'MASUK' ? 'Diterima' : 'Dibuat'}:
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">
                      {new Date(surat.tanggal_diterima_dibuat).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} pukul {new Date(surat.tanggal_diterima_dibuat).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Asal Surat */}
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {surat.arah_surat === 'MASUK' ? 'Asal Surat' : 'Dari'}:
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">{surat.asal_surat}</p>
                  </div>

                  {/* Tujuan Surat */}
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {surat.arah_surat === 'MASUK' ? 'Kepada' : 'Tujuan Surat'}:
                    </span>
                    <p className="text-gray-900 dark:text-gray-100">{surat.tujuan_surat}</p>
                  </div>

                  {/* Tipe Dokumen */}
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Tipe Dokumen:</span>
                    <p className="text-gray-900 dark:text-gray-100">{formatEnumText(surat.tipe_dokumen)}</p>
                  </div>

                  {/* Tujuan Disposisi */}
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Tujuan Disposisi:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {surat.tujuan_disposisi.map((tujuan) => (
                        <span
                          key={tujuan}
                          className={`px-2 py-1 text-xs rounded-full ${getTagColor(tujuan)}`}
                          title={formatEnumText(
                            tujuan
                              .replace('KASUBBID_', '')
                              .replace('KASUBBAG_', '')
                              .replace('KAUR_', '')
                          )}
                        >
                          {formatEnumText(
                            tujuan
                              .replace('KASUBBID_', '')
                              .replace('KASUBBAG_', '')
                              .replace('KAUR_', '')
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Perihal */}
                <div className="mt-4">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Perihal:</span>
                  <p className="text-gray-900 dark:text-gray-100 mt-1">{surat.perihal}</p>
                </div>

                {/* Isi Disposisi */}
                <div className="mt-4">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Isi Disposisi:</span>
                  <p className="text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-wrap">{surat.isi_disposisi}</p>
                </div>

                {/* Lampiran */}
                {surat.lampiran.length > 0 && (
                  <div className="mt-4">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Lampiran:</span>
                    <div className="mt-2 space-y-2">
                      {surat.lampiran.map((lampiran) => (
                        <div
                          key={lampiran.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm text-gray-900 dark:text-gray-100">{lampiran.nama_file}</span>
                          </div>
                          <button
                            onClick={() => window.open(lampiran.path_file, '_blank')}
                            className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                          >
                            Buka
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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