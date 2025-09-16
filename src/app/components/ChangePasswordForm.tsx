// file: app/components/ChangePasswordForm.tsx
'use client';

import { FormEvent, useRef } from 'react';
import { changePassword } from '@/app/(app)/profile/actions'; // Menggunakan path alias yang benar
import toast from 'react-hot-toast';

export default function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // 1. Validasi di sisi klien untuk memastikan password baru cocok
    if (newPassword !== confirmPassword) {
      toast.error('Password baru dan konfirmasi tidak cocok.');
      return;
    }

    // 2. Panggil Server Action
    const result = await changePassword(formData);

    // 3. Tangani respons dari server
    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      toast.success(result.success);
      formRef.current?.reset(); // Kosongkan form setelah berhasil
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white border-b dark:border-gray-700 pb-2">
        Ganti Password
      </h4>
      <div>
        <label
          htmlFor="currentPassword"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Password Saat Ini
        </label>
        <input
          type="password"
          name="currentPassword"
          id="currentPassword"
          required
          className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
        />
      </div>
      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Password Baru
        </label>
        <input
          type="password"
          name="newPassword"
          id="newPassword"
          required
          minLength={8} // Menambahkan validasi dasar
          className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
        />
         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimal 8 karakter.</p>
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Konfirmasi Password Baru
        </label>
        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          required
          className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
        />
      </div>
      <div className="text-right border-t dark:border-gray-700 pt-4">
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Ubah Password
        </button>
      </div>
    </form>
  );
}
