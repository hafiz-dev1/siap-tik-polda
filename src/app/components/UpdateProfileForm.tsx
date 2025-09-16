// file: app/components/UpdateProfileForm.tsx
'use client';

import { FormEvent, useRef } from 'react';
import { updateProfile } from '@/app/(app)/profile/actions'; // Menggunakan path alias yang benar
import { Pengguna } from '@prisma/client';
import toast from 'react-hot-toast';

export default function UpdateProfileForm({ user }: { user: Pengguna }) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    // Panggil Server Action
    const result = await updateProfile(formData);
    
    // Tangani respons dari server
    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      toast.success(result.success);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">
        Informasi Profil
      </h4>
      <div>
        <label
          htmlFor="nama"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Nama Lengkap
        </label>
        <input
          type="text"
          name="nama"
          id="nama"
          defaultValue={user.nama}
          required
          className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
        />
      </div>
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Username
        </label>
        <input
          type="text"
          name="username"
          id="username"
          defaultValue={user.username}
          required
          className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
        />
      </div>
      <div>
        <label
          htmlFor="nrp_nip"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          NIP / NRP
        </label>
        <input
          type="text"
          name="nrp_nip"
          id="nrp_nip"
          defaultValue={user.nrp_nip || ''}
          placeholder="Isi NIP atau NRP Anda"
          className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
        />
      </div>
      <div>
        <label
          htmlFor="profilePicture"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Ganti Foto Profil
        </label>
        <input
          type="file"
          name="profilePicture"
          id="profilePicture"
          accept="image/*"
          className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/50 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900"
        />
      </div>
      <div className="text-right border-t dark:border-gray-700 pt-4">
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Simpan Perubahan
        </button>
      </div>
    </form>
  );
}
