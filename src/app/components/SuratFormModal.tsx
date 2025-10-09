// file: app/components/SuratFormModal.tsx
'use client';

import { useState, FormEvent, useRef, Fragment, ReactNode, MouseEvent, ChangeEvent } from 'react';
import { flushSync } from 'react-dom';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { createSurat, updateSurat } from '@/app/(app)/admin/actions'; // Menggunakan path alias yang benar
import toast from 'react-hot-toast';
import { Surat } from '@prisma/client';

// Konstanta untuk membangun form
const TUJUAN_DISPOSISI = [ 'KASUBBID_TEKKOM', 'KASUBBID_TEKINFO', 'KASUBBAG_RENMIN', 'KAUR_KEU' ];
const TIPE_DOKUMEN = ['NOTA_DINAS', 'SURAT_BIASA', 'SPRIN', 'TELEGRAM'];
const ARAH_SURAT = ['MASUK', 'KELUAR'];

// Komponen sekarang menerima prop `children` untuk pemicu modal
type Props = {
  suratToEdit?: Surat;
  children: ReactNode; // Prop untuk elemen pemicu (tombol/link)
};

export default function SuratFormModal({ suratToEdit, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = suratToEdit !== undefined;
  const [selectedFileName, setSelectedFileName] = useState('');
  const [inputAccept, setInputAccept] = useState('application/pdf,image/*');
  const [captureSetting, setCaptureSetting] = useState<"user" | "environment" | undefined>(undefined);

  const closeModal = () => {
    setIsOpen(false);
    setSelectedFileName('');
    setInputAccept('application/pdf,image/*');
    setCaptureSetting(undefined);

    const input = fileInputRef.current;
    if (input) {
      input.value = '';
    }
  };
  
  // Menghentikan propagasi event agar tidak memicu modal lain
  const openModal = (e?: MouseEvent) => {
    e?.stopPropagation(); 
    setIsOpen(true);
  }

  // Helper untuk format tanggal
  const formatDateForInput = (date: string | Date, includeTime = false) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    if (isNaN(d.getTime())) return '';
    
    const isoString = d.toISOString();
    if (includeTime) {
      return isoString.substring(0, 16);
    }
    return isoString.split('T')[0];
  };

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
      'KASUBBID_TEKKOM': 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700',
      'KASUBBID_TEKINFO': 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
      'KASUBBAG_RENMIN': 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700',
      'KAUR_KEU': 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700'
    };
    return colorMap[target] || 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700';
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const result = isEditMode
      ? await updateSurat(suratToEdit.id, formData)
      : await createSurat(formData);
    
    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      toast.success(result.success);
      closeModal();
    }
  }

  const openFilePicker = () => {
    const input = fileInputRef.current;
    if (!input) return;

    flushSync(() => {
      setInputAccept('application/pdf,image/*');
      setCaptureSetting(undefined);
    });

    input.value = '';
    setSelectedFileName('');
    input.click();
  };

  const openCameraCapture = () => {
    const input = fileInputRef.current;
    if (!input) return;

    flushSync(() => {
      setInputAccept('image/*');
      setCaptureSetting('environment');
    });

    input.value = '';
    setSelectedFileName('');
    input.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFileName(file ? file.name : '');

    if (!file) {
      setInputAccept('application/pdf,image/*');
      setCaptureSetting(undefined);
    }
  };

  const clearSelectedFile = () => {
    const input = fileInputRef.current;
    if (!input) return;

    input.value = '';
    setSelectedFileName('');
    setInputAccept('application/pdf,image/*');
    setCaptureSetting(undefined);
  };

  return (
    <>
      {/* Elemen pemicu (children) dibungkus dengan div yang memiliki onClick */}
      <div onClick={openModal} className="contents cursor-pointer">
        {children}
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10 focus:outline-none" onClose={closeModal}>
          <div className="fixed inset-0 bg-black/30 dark:bg-black/50" aria-hidden="true" />
          <div className="fixed inset-0 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <DialogPanel className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-800 shadow-xl overflow-hidden">
                  <DialogTitle as="h3" className="text-base font-semibold text-white bg-gradient-to-r from-indigo-800 to-indigo-600 dark:from-indigo-900 dark:to-indigo-700 px-5 py-3 text-center">
                    {isEditMode ? 'Ubah Surat' : 'Tambah Surat'}
                  </DialogTitle>
                  
                  <div className="p-5">
                    <form ref={formRef} onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto pr-2 space-y-4">
                    {/* Semua input diisi dengan defaultValue untuk mode Ubah */}
                    <div className="grid grid-cols-1 md:grid-cols-2 pt-2 gap-x-7 gap-y-3">
                      <div className="flex items-center">
                        <label htmlFor="nomor_agenda" className="text-sm font-medium text-gray-700 dark:text-gray-300 w-27 flex-shrink-0">Nomor Agenda</label>
                        <input type="text" name="nomor_agenda" id="nomor_agenda" defaultValue={suratToEdit?.nomor_agenda || undefined} className="pl-2 block w-full rounded-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm" placeholder="(opsional)"/>
                      </div>
                      <div className="flex items-center">
                        <label htmlFor="nomor_surat" className="text-sm font-medium text-gray-700 dark:text-gray-300 w-27 flex-shrink-0">Nomor Surat</label>
                        <input type="text" name="nomor_surat" id="nomor_surat" required defaultValue={suratToEdit?.nomor_surat} className="pl-2 block w-full rounded-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"/>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-7 gap-y-3">
                      <div className="flex items-center">
                        <label htmlFor="tanggal_surat" className="text-sm font-medium text-gray-700 dark:text-gray-300 w-27 flex-shrink-0">Tanggal Surat</label>
                        <input type="date" name="tanggal_surat" id="tanggal_surat" required defaultValue={suratToEdit ? formatDateForInput(suratToEdit.tanggal_surat) : ''} className="pl-2 block w-full rounded-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm cursor-pointer"/>
                      </div>
                      <div className="flex items-center">
                        <label htmlFor="tanggal_diterima_dibuat" className="text-sm font-medium text-gray-700 dark:text-gray-300 w-27 flex-shrink-0">Tgl Diterima</label>
                        <input type="datetime-local" name="tanggal_diterima_dibuat" id="tanggal_diterima_dibuat" defaultValue={suratToEdit?.tanggal_diterima_dibuat ? formatDateForInput(suratToEdit.tanggal_diterima_dibuat, true) : ''} className="pl-2 block w-full rounded-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm cursor-pointer" placeholder="(opsional)"/>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-7 gap-y-3">
                      <div className="flex items-center">
                        <label htmlFor="asal_surat" className="text-sm font-medium text-gray-700 dark:text-gray-300 w-27 flex-shrink-0">Asal Surat</label>
                        <input type="text" name="asal_surat" id="asal_surat" required defaultValue={suratToEdit?.asal_surat} className="pl-2 block w-full rounded-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm" list="asal-surat-list"/>
                        <datalist id="asal-surat-list">
                          <option value="Bagian Umum" />
                          <option value="Bagian Keuangan" />
                          <option value="Bagian Perencanaan" />
                          <option value="Bagian Operasi" />
                          {/* Tambahkan opsi lain sesuai kebutuhan */}
                        </datalist>
                      </div>
                      <div className="flex items-center">
                        <label htmlFor="tujuan_surat" className="text-sm font-medium text-gray-700 dark:text-gray-300 w-27 flex-shrink-0">Tujuan Surat</label>
                        <input type="text" name="tujuan_surat" id="tujuan_surat" required defaultValue={suratToEdit?.tujuan_surat} className="pl-2 block w-full rounded-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm" list="tujuan-surat-list"/>
                        <datalist id="tujuan-surat-list">
                          <option value="Bagian Umum" />
                          <option value="Bagian Keuangan" />
                          <option value="Bagian Perencanaan" />
                          <option value="Bagian Operasi" />
                          {/* Tambahkan opsi lain sesuai kebutuhan */}
                        </datalist>
                      </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-7 gap-y-3">
                      <div className="flex items-center">
                        <label htmlFor="arah_surat" className="text-sm font-medium text-gray-700 dark:text-gray-300 w-27 flex-shrink-0">Arah Surat</label>
                        <div className="relative w-full">
                          <select name="arah_surat" id="arah_surat" required defaultValue={suratToEdit?.arah_surat} className="pl-2 py-0.25 block w-full rounded-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm appearance-none pr-8 cursor-pointer">
                            {ARAH_SURAT.map(arah => <option key={arah} value={arah}>{formatEnumText(arah)}</option>)}
                          </select>
                          <svg className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <label htmlFor="tipe_dokumen" className="text-sm font-medium text-gray-700 dark:text-gray-300 w-27 flex-shrink-0">Tipe Dokumen</label>
                        <div className="relative w-full">
                          <select name="tipe_dokumen" id="tipe_dokumen" required defaultValue={suratToEdit?.tipe_dokumen} className="pl-2 py-0.25 block w-full rounded-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm appearance-none pr-8 cursor-pointer">
                            {TIPE_DOKUMEN.map(tipe => <option key={tipe} value={tipe}>{formatEnumText(tipe)}</option>)}
                          </select>
                          <svg className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="perihal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Perihal</label>
                      <textarea name="perihal" id="perihal" rows={2} required defaultValue={suratToEdit?.perihal} className="pl-2 mt-1 ml-1 block w-full rounded-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tujuan Disposisi</label>
                      <div className="ml-3 grid grid-cols-2 gap-2.5">
                        {TUJUAN_DISPOSISI.map((tujuan) => (
                          <label key={tujuan} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="tujuan_disposisi"
                              value={tujuan}
                              defaultChecked={suratToEdit?.tujuan_disposisi.includes(tujuan)}
                              className="h-4 w-4 rounded border-gray-300 dark:border-gray-500 cursor-pointer focus:ring-2 focus:ring-indigo-500 checked:bg-indigo-600 checked:border-indigo-600 dark:checked:bg-indigo-500 dark:checked:border-indigo-500 bg-white dark:bg-gray-600"
                            />
                            <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-sm ${getTagColor(tujuan)}`}>
                              {formatDispositionTarget(tujuan)}
                            </span>
                          </label>
                        ))}
                      </div>
                      {/* <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                        Pilih satu atau lebih tujuan disposisi yang sesuai.
                        </p> */}
                    </div>
                        <div>
                          <label htmlFor="isi_disposisi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Isi Disposisi</label>
                          <textarea name="isi_disposisi" id="isi_disposisi" rows={2} required defaultValue={suratToEdit?.isi_disposisi} className="pl-2 mt-1 ml-1 block w-full rounded-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"></textarea>
                        </div>
                    <div className={isEditMode ? 'hidden' : 'space-y-2'}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="scan_surat">Upload Scan Surat (PDF, JPG, PNG)</label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={openFilePicker}
                            className="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:text-white hover:border-indigo-600 rounded-sm border border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-200 dark:border-indigo-700 cursor-pointer"
                          >
                            Upload File
                          </button>
                          <button
                            type="button"
                            onClick={openCameraCapture}
                            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-700 to-emerald-600 rounded-sm hover:from-emerald-800 hover:to-emerald-700 dark:from-emerald-800 dark:to-emerald-700 dark:hover:from-emerald-900 dark:hover:to-emerald-800 transition-all duration-200 cursor-pointer"
                          >
                            Ambil Foto
                          </button>
                          {selectedFileName && (
                            <button
                              type="button"
                              onClick={clearSelectedFile}
                              className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-sm dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                            >
                              Hapus Pilihan
                            </button>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          name="scan_surat"
                          id="scan_surat"
                          accept={inputAccept}
                          capture={captureSetting}
                          required={!isEditMode}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                          Kamera perangkat akan terbuka ketika memilih opsi Ambil Foto Kamera pada smartphone yang mendukung.
                        </p> */}
                        {selectedFileName && (
                          <p className="text-sm text-gray-700 dark:text-gray-200">File dipilih: <span className="font-medium">{selectedFileName}</span></p>
                        )}
                    </div>
                    {isEditMode && <p className="text-xs text-gray-500 dark:text-gray-400">Upload ulang scan surat tidak didukung dalam mode ubah.</p>}
                    <div className="mt-4 flex justify-end gap-3 border-t dark:border-gray-700 pt-3">
                      <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-sm hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 cursor-pointer" onClick={closeModal}>Batal</button>
                      <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-800 to-indigo-700 rounded-sm hover:from-indigo-900 hover:to-indigo-800 dark:from-indigo-900 dark:to-indigo-700 dark:hover:from-indigo-950 dark:hover:to-indigo-800 transition-all duration-200 cursor-pointer">{isEditMode ? 'Simpan Perubahan' : 'Simpan'}</button>
                    </div>
                  </form>
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
