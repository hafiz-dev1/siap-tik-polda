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

  // Format date safely
  const formatTanggalDiterima = (date: Date | null) => {
    if (!date) return '-';
    const d = new Date(date);
    return `${d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })} pukul ${d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })} WIB`;
  };

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
                  {/* Detail Utama - 2 Kolom dengan urutan yang disesuaikan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                    {/* Tipe Surat - Mobile: 1, Desktop: 1 */}
                    <div className="order-1">
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">Tipe Surat:</span>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{formatEnumText(surat.tipe_dokumen)}</p>
                    </div>

                    {/* Arah Surat - Mobile: 2, Desktop: 2 */}
                    <div className="order-2">
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">Arah Surat:</span>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{formatEnumText(surat.arah_surat)}</p>
                    </div>

                    {/* Kepada - Mobile: 3, Desktop: 3 */}
                    <div className="order-3">
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">Kepada:</span>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{surat.tujuan_surat}</p>
                    </div>

                    {/* Nomor - Mobile: 4, Desktop: 5 */}
                    <div className="order-4 md:order-5">
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">Nomor:</span>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{surat.nomor_agenda || '-'}</p>
                    </div>

                    {/* Surat dari - Mobile: 5, Desktop: 7 */}
                    <div className="order-5 md:order-7">
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">Surat dari:</span>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{surat.asal_surat}</p>
                    </div>

                    {/* Nomor Surat - Mobile: 6, Desktop: 4 */}
                    <div className="order-6 md:order-4">
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">Nomor Surat:</span>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">{surat.nomor_surat}</p>
                    </div>

                    {/* Tanggal - Mobile: 7, Desktop: 6 */}
                    <div className="order-7 md:order-6">
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">Tanggal:</span>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">
                        {new Date(surat.tanggal_surat).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Tgl Diterima - Mobile: 8, Desktop: 8 */}
                    <div className="order-8">
                      <span className="text-gray-400 dark:text-gray-500 block mb-1">Tgl Diterima:</span>
                      <p className="text-gray-900 dark:text-gray-100 font-medium">
                        {formatTanggalDiterima(surat.tanggal_diterima_dibuat)}
                      </p>
                    </div>
                  </div>

                  {/* Perihal */}
                  <div>
                    <span className="text-gray-400 dark:text-gray-500 block mb-1">Perihal:</span>
                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{surat.perihal}</p>
                  </div>

                  {/* Tujuan Disposisi & Isi Disposisi - 2 Kolom (1/3 : 2/3) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-7 gap-y-4">
                    {/* Tujuan Disposisi - Kolom Kiri (1/3) */}
                    <div className="md:col-span-1">
                      <span className="text-gray-400 dark:text-gray-500 block mb-2">Tujuan Disposisi:</span>
                      <div className="flex flex-col gap-2">
                        {surat.tujuan_disposisi.map((tujuan) => (
                          <span
                            key={tujuan}
                            className={`inline-block px-2.5 py-1 text-xs font-medium rounded-sm ${getTagColor(tujuan)}`}
                            title={formatDispositionTarget(tujuan)}
                          >
                            {formatDispositionTarget(tujuan)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Isi Disposisi - Kolom Kanan (2/3) */}
                    <div className="md:col-span-2">
                      <span className="text-gray-400 dark:text-gray-500 block mb-2">Isi Disposisi:</span>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-sm border border-gray-200 dark:border-gray-600">
                        <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{surat.isi_disposisi}</p>
                      </div>
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
                            className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300 text-sm cursor-pointer bg-transparent border-none p-0 block"
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
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
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