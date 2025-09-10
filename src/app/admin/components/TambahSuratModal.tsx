// file: app/admin/components/TambahSuratModal.tsx
'use client';

import { useState, FormEvent, useRef } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { createSurat } from '../actions';
import toast from 'react-hot-toast';

const TUJUAN_DISPOSISI = [
  'KASUBBID_TEKKOM',
  'KASUBBID_TEKINFO',
  'KASUBBAG_RENMIN',
  'KAUR_KEU',
];

export default function TambahSuratModal() {
  let [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }
  
  const formatEnumText = (text: string) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    // Pengecekan sisi klien untuk memastikan setidaknya satu checkbox dipilih
    if (formData.getAll('tujuan_disposisi').length === 0) {
      toast.error('Harap pilih setidaknya satu Tujuan Disposisi.');
      return;
    }

    const result = await createSurat(formData);
    
    if (result?.message.includes('Gagal')) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
      formRef.current?.reset();
      closeModal();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        + Tambah Surat Baru
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
                <DialogPanel className="w-full max-w-2xl rounded-xl bg-white p-6">
                  <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">
                    Tambah Arsip Surat Baru
                  </DialogTitle>
                  
                  <form ref={formRef} onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* Input fields lain */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="nomor_surat" className="block text-sm font-medium text-gray-700">Nomor Surat</label>
                            <input type="text" name="nomor_surat" id="nomor_surat" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                        <div>
                            <label htmlFor="tanggal_surat" className="block text-sm font-medium text-gray-700">Tanggal Surat</label>
                            <input type="date" name="tanggal_surat" id="tanggal_surat" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="perihal" className="block text-sm font-medium text-gray-700">Perihal</label>
                        <textarea name="perihal" id="perihal" rows={3} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="asal_surat" className="block text-sm font-medium text-gray-700">Asal Surat</label>
                            <input type="text" name="asal_surat" id="asal_surat" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                        <div>
                            <label htmlFor="tujuan_surat" className="block text-sm font-medium text-gray-700">Tujuan Surat</label>
                            <input type="text" name="tujuan_surat" id="tujuan_surat" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="arah_surat" className="block text-sm font-medium text-gray-700">Arah Surat</label>
                            <select name="arah_surat" id="arah_surat" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option value="MASUK">Masuk</option>
                                <option value="KELUAR">Keluar</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="tipe_dokumen" className="block text-sm font-medium text-gray-700">Tipe Dokumen</label>
                            <select name="tipe_dokumen" id="tipe_dokumen" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                <option value="NOTA_DINAS">Nota Dinas</option>
                                <option value="SURAT_BIASA">Surat Biasa</option>
                                <option value="SPRIN">Sprin</option>
                                <option value="TELEGRAM">Telegram</option>
                            </select>
                        </div>
                    </div>

                    {/* === BAGIAN CHECKBOX UNTUK MULTI-PILIH === */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tujuan Disposisi (bisa pilih lebih dari satu)</label>
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                          {TUJUAN_DISPOSISI.map((tujuan) => (
                            <label key={tujuan} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                name="tujuan_disposisi"
                                value={tujuan}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <span className="text-sm text-gray-800">
                                {formatEnumText(tujuan.replace('KASUBBID_', '').replace('KASUBBAG_', '').replace('KAUR_', ''))}
                              </span>
                            </label>
                          ))}
                        </div>
                    </div>

                     <div>
                        <label htmlFor="isi_disposisi" className="block text-sm font-medium text-gray-700">Isi Disposisi</label>
                        <textarea name="isi_disposisi" id="isi_disposisi" rows={3} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                      <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200" onClick={closeModal}>
                        Batal
                      </button>
                      <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                        Simpan
                      </button>
                    </div>
                  </form>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}