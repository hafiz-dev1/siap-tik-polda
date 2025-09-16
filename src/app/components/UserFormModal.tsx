// file: app/components/UserFormModal.tsx
'use client';

import { useState, FormEvent, useRef, Fragment, MouseEvent } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { createUser, updateUser } from '@/app/(app)/admin/users/actions'; // Menggunakan path alias yang benar
import toast from 'react-hot-toast';
import { Pengguna } from '@prisma/client';

type Props = {
  userToEdit?: Pengguna; // Prop opsional untuk mode "Ubah"
};

export default function UserFormModal({ userToEdit }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const isEditMode = userToEdit !== undefined;

  const closeModal = () => setIsOpen(false);
  
  // Menghentikan propagasi event agar tidak memicu modal detail
  const openModal = (e?: MouseEvent) => {
    e?.stopPropagation(); 
    setIsOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
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
        <button onClick={openModal} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Ubah</button>
      ) : (
        <button
          onClick={openModal}
          className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          + Tambah Pengguna
        </button>
      )}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10 focus:outline-none" onClose={closeModal}>
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <DialogPanel className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                  <DialogTitle as="h3" className="text-lg font-medium text-gray-900 border-b pb-2">
                    {isEditMode ? 'Ubah Data Pengguna' : 'Tambah Pengguna Baru'}
                  </DialogTitle>
                  <form ref={formRef} onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="nama" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                      <input type="text" name="nama" id="nama" required defaultValue={userToEdit?.nama} className="mt-1 w-full rounded-md border-gray-300 shadow-sm"/>
                    </div>
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                      <input 
                        type="text" 
                        name="username" 
                        id="username" 
                        required 
                        defaultValue={userToEdit?.username} 
                        disabled={isEditMode} // Username DIKUNCI (tidak bisa diubah) saat mode Ubah
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                     <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                      <input 
                        type="password" 
                        name="password" 
                        id="password" 
                        required={!isEditMode} // Hanya wajib diisi saat membuat baru
                        placeholder={isEditMode ? 'Kosongkan jika tidak diubah' : ''} 
                        className="mt-1 w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">Peran</label>
                      <select name="role" id="role" required defaultValue={userToEdit?.role || 'USER'} className="mt-1 w-full rounded-md border-gray-300 shadow-sm">
                        <option value="USER">User Biasa</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                    
                    {/* Input file foto profil HANYA muncul saat mode Tambah Baru */}
                    {!isEditMode && (
                      <div>
                        <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">Foto Profil (Opsional)</label>
                        <input type="file" name="profilePicture" id="profilePicture" accept="image/*" className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                      </div>
                    )}

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