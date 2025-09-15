// file: app/admin/components/SuratFormModal.tsx
'use client';

import { useState, FormEvent, useRef, Fragment, MouseEvent } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { createSurat, updateSurat } from '../actions';
import toast from 'react-hot-toast';
import { SuratType } from '../types';

// Konstanta untuk membangun elemen form
const TUJUAN_DISPOSISI = [ 'KASUBBID_TEKKOM', 'KASUBBID_TEKINFO', 'KASUBBAG_RENMIN', 'KAUR_KEU' ];
const TIPE_DOKUMEN = ['NOTA_DINAS', 'SURAT_BIASA', 'SPRIN', 'TELEGRAM'];
const ARAH_SURAT = ['MASUK', 'KELUAR'];

// Komponen menerima prop `suratToEdit` opsional untuk menentukan modenya
type Props = {
  suratToEdit?: SuratType;
};

export default function SuratFormModal({ suratToEdit }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const isEditMode = suratToEdit !== undefined;

  // Fungsi openModal sekarang menerima event dan menghentikan propagasinya
  const openModal = (e?: MouseEvent) => {
    e?.stopPropagation(); // Mencegah klik "merambat" ke <tr>
    setIsOpen(true);
  }
  const closeModal = () => setIsOpen(false);

  // Fungsi helper untuk memformat tanggal
  const formatDateForInput = (date: string | Date, includeTime = false) => {
    const d = new Date(date);
    // Sesuaikan dengan timezone lokal (WIB adalah UTC+7) sebelum mengubah ke string
    d.setHours(d.getHours() + 7);
    if (isNaN(d.getTime())) return '';
    
    const isoString = d.toISOString();
    const datePart = isoString.split('T')[0];
    
    if (includeTime) {
      const timePart = isoString.split('T')[1].substring(0, 5);
      return `${datePart}T${timePart}`;
    }
    return datePart;
  };

  const formatEnumText = (text: string) => text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const result = isEditMode
      ? await updateSurat(suratToEdit.id, formData)
      : await createSurat(formData);
    
    if (result?.message.includes('Gagal')) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
      closeModal();
    }
  }

  return (
    <>
      {/* Komponen ini sekarang merender tombol pemicunya sendiri */}
      {isEditMode ? (
        <button onClick={openModal} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Ubah</button>
      ) : (
        <button onClick={() => openModal()} className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
          + Tambah Surat Baru
        </button>
      )}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10 focus:outline-none" onClose={closeModal}>
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <DialogPanel className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
                  <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">
                    {isEditMode ? 'Ubah Arsip Surat' : 'Tambah Arsip Surat Baru'}
                  </DialogTitle>
                  
                  <form ref={formRef} onSubmit={handleSubmit} className="mt-4 max-h-[70vh] overflow-y-auto pr-2 space-y-4">
                    {/* Semua input diisi dengan defaultValue untuk mode Ubah */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="nomor_agenda" className="block text-sm font-medium text-gray-700">Nomor Agenda</label>
                            <input type="text" name="nomor_agenda" id="nomor_agenda" required defaultValue={suratToEdit?.nomor_agenda} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                        <div>
                            <label htmlFor="nomor_surat" className="block text-sm font-medium text-gray-700">Nomor Surat</label>
                            <input type="text" name="nomor_surat" id="nomor_surat" required defaultValue={suratToEdit?.nomor_surat} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="tanggal_surat" className="block text-sm font-medium text-gray-700">Tanggal Surat</label>
                            <input type="date" name="tanggal_surat" id="tanggal_surat" required defaultValue={suratToEdit ? formatDateForInput(suratToEdit.tanggal_surat) : ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                        <div>
                            <label htmlFor="tanggal_diterima_dibuat" className="block text-sm font-medium text-gray-700">Tanggal & Pukul Diterima</label>
                            <input type="datetime-local" name="tanggal_diterima_dibuat" id="tanggal_diterima_dibuat" required defaultValue={suratToEdit ? formatDateForInput(suratToEdit.tanggal_diterima_dibuat, true) : ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="perihal" className="block text-sm font-medium text-gray-700">Perihal</label>
                        <textarea name="perihal" id="perihal" rows={2} required defaultValue={suratToEdit?.perihal} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="asal_surat" className="block text-sm font-medium text-gray-700">Asal Surat</label>
                            <input type="text" name="asal_surat" id="asal_surat" required defaultValue={suratToEdit?.asal_surat} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                        <div>
                            <label htmlFor="tujuan_surat" className="block text-sm font-medium text-gray-700">Tujuan Surat</label>
                            <input type="text" name="tujuan_surat" id="tujuan_surat" required defaultValue={suratToEdit?.tujuan_surat} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="arah_surat" className="block text-sm font-medium text-gray-700">Arah Surat</label>
                            <select name="arah_surat" id="arah_surat" required defaultValue={suratToEdit?.arah_surat} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                {ARAH_SURAT.map(arah => <option key={arah} value={arah}>{formatEnumText(arah)}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="tipe_dokumen" className="block text-sm font-medium text-gray-700">Tipe Dokumen</label>
                            <select name="tipe_dokumen" id="tipe_dokumen" required defaultValue={suratToEdit?.tipe_dokumen} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                {TIPE_DOKUMEN.map(tipe => <option key={tipe} value={tipe}>{formatEnumText(tipe)}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tujuan Disposisi</label>
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                          {TUJUAN_DISPOSISI.map((tujuan) => (
                            <label key={tujuan} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                name="tujuan_disposisi"
                                value={tujuan}
                                defaultChecked={suratToEdit?.tujuan_disposisi.includes(tujuan)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <span className="text-sm text-gray-800">{formatEnumText(tujuan.replace('KASUBBID_', '').replace('KASUBBAG_', '').replace('KAUR_', ''))}</span>
                            </label>
                          ))}
                        </div>
                    </div>
                     <div>
                        <label htmlFor="isi_disposisi" className="block text-sm font-medium text-gray-700">Isi Disposisi</label>
                        <textarea name="isi_disposisi" id="isi_disposisi" rows={2} required defaultValue={suratToEdit?.isi_disposisi} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                    </div>
                    <div className={isEditMode ? 'hidden' : 'block'}>
                        <label htmlFor="scan_surat" className="block text-sm font-medium text-gray-700">Upload Scan Surat (PDF, JPG, PNG)</label>
                        <input type="file" name="scan_surat" id="scan_surat" required={!isEditMode} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                    </div>
                    {isEditMode && <p className="text-xs text-gray-500">Upload ulang scan surat tidak didukung dalam mode ubah.</p>}
                    <div className="mt-6 flex justify-end gap-4 border-t pt-4">
                      <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200" onClick={closeModal}>Batal</button>
                      <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">{isEditMode ? 'Simpan Perubahan' : 'Simpan'}</button>
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