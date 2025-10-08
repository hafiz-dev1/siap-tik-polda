// file: app/components/UserFormModal.tsx
'use client';

import { useState, FormEvent, useRef, Fragment, MouseEvent } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { createUser, updateUser } from '@/app/(app)/admin/users/actions'; // Menggunakan path alias yang benar
import toast from 'react-hot-toast';
import { Pengguna } from '@prisma/client';

type Props = {
  userToEdit?: Pengguna; // Prop opsional untuk menentukan mode
};

export default function UserFormModal({ userToEdit }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const isEditMode = userToEdit !== undefined;
  const isSuperAdmin = userToEdit?.role === 'SUPER_ADMIN';

  const closeModal = () => setIsOpen(false);
  
  // Menghentikan propagasi event agar tidak memicu modal detail
  const openModal = (e?: MouseEvent) => {
    e?.stopPropagation();
    setIsOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    // Validasi password jika mode edit dan password diisi
    if (isEditMode) {
      const password = formData.get('password') as string;
      const confirmPassword = formData.get('confirmPassword') as string;
      
      if (password || confirmPassword) {
        if (password !== confirmPassword) {
          toast.error('Password dan konfirmasi password tidak cocok!');
          return;
        }
        
        if (password.length < 6) {
          toast.error('Password minimal 6 karakter!');
          return;
        }
      }
    }
    
    // Memanggil action yang sesuai berdasarkan mode
    const result = isEditMode
      ? await updateUser(userToEdit.id, formData)
      : await createUser(formData);
    
    // Menangani respons standar { success: ... } atau { error: ... }
    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      toast.success(result.success);
      formRef.current?.reset();
      closeModal();
    }
  }

  return (
    <>
      {/* Komponen ini merender tombol pemicunya sendiri, tergantung mode */}
      {isEditMode ? (
        <button 
          onClick={openModal} 
          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium cursor-pointer"
        >
          Ubah
        </button>
      ) : (
        <button
          onClick={openModal}
          type="button"
          className="px-3 py-2 bg-gradient-to-r from-indigo-800 to-indigo-600 text-white rounded-md hover:from-indigo-900 hover:to-indigo-700 dark:from-indigo-900 dark:to-indigo-700 dark:hover:from-indigo-950 dark:hover:to-indigo-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all whitespace-nowrap flex items-center gap-1.5 text-sm cursor-pointer"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
            />
          </svg>
          Tambah Pengguna
        </button>
      )}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10 focus:outline-none" onClose={closeModal}>
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
                <DialogPanel className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-800 shadow-xl overflow-hidden">
                  <DialogTitle as="h3" className="text-base font-semibold text-white bg-gradient-to-r from-indigo-800 to-indigo-600 dark:from-indigo-900 dark:to-indigo-700 px-5 py-3 text-center">
                    {isEditMode ? 'Ubah Data Pengguna' : 'Tambah Pengguna Baru'}
                  </DialogTitle>
                  
                  <div className="p-5">
                    <form ref={formRef} onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto pr-2 space-y-4">
                      <div>
                        <label htmlFor="nama" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Lengkap</label>
                        <input 
                          type="text" 
                          name="nama" 
                          id="nama" 
                          required 
                          defaultValue={userToEdit?.nama} 
                          className="pl-2 mt-1 block w-full rounded-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                        <input 
                          type="text" 
                          name="username" 
                          id="username" 
                          required 
                          defaultValue={userToEdit?.username} 
                          disabled={isEditMode}
                          className="pl-2 mt-1 block w-full rounded-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                        />
                        {isEditMode && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Username tidak dapat diubah setelah akun dibuat.
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {isEditMode ? 'Password Baru' : 'Password'}
                        </label>
                        <input 
                          type="password" 
                          name="password" 
                          id="password" 
                          required={!isEditMode}
                          placeholder={isEditMode ? 'Kosongkan jika tidak diubah' : ''} 
                          className="pl-2 mt-1 block w-full rounded-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                        />
                      </div>
                      
                      {isEditMode && (
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Konfirmasi Password Baru
                          </label>
                          <input 
                            type="password" 
                            name="confirmPassword" 
                            id="confirmPassword" 
                            placeholder="Ketik ulang password baru"
                            className="pl-2 mt-1 block w-full rounded-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                          />
                        </div>
                      )}
                      
                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Peran</label>
                        <div className="relative w-full">
                          <select 
                            name="role" 
                            id="role" 
                            required 
                            defaultValue={userToEdit?.role || 'ADMIN'} 
                            disabled={isSuperAdmin}
                            className={`pl-2 mt-1 block w-full rounded-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm appearance-none pr-8 ${
                              isSuperAdmin ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
                            }`}
                          >
                            <option value="ADMIN">Admin</option>
                            {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin</option>}
                          </select>
                          <svg className="absolute right-2 top-1/2 translate-y-[-25%] h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                        {isSuperAdmin && (
                          <>
                            <input type="hidden" name="role" value="SUPER_ADMIN" />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Hanya ada satu Super Admin aktif. Peran ini tidak dapat diubah.
                            </p>
                          </>
                        )}
                      </div>
                      
                      {!isEditMode && (
                        <div>
                          <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Foto Profil (Opsional)</label>
                          <input 
                            type="file" 
                            name="profilePicture" 
                            id="profilePicture" 
                            accept="image/*" 
                            className="mt-1 block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/40 file:text-indigo-700 dark:file:text-indigo-200 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/60 file:cursor-pointer cursor-pointer"
                          />
                        </div>
                      )}

                      <div className="mt-4 flex justify-end gap-3 border-t dark:border-gray-700 pt-3">
                        <button 
                          type="button" 
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-sm hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 cursor-pointer" 
                          onClick={closeModal}
                        >
                          Batal
                        </button>
                        <button 
                          type="submit" 
                          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-800 to-indigo-700 rounded-sm hover:from-indigo-900 hover:to-indigo-800 dark:from-indigo-900 dark:to-indigo-700 dark:hover:from-indigo-950 dark:hover:to-indigo-800 transition-all duration-200 cursor-pointer"
                        >
                          {isEditMode ? 'Simpan Perubahan' : 'Simpan'}
                        </button>
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