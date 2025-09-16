// file: app/components/ChangePasswordForm.tsx
'use client';

import { FormEvent, useRef } from 'react';
import { changePassword } from '@/app/(app)/profile/actions';
import toast from 'react-hot-toast';

export default function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validasi sisi klien
    if (newPassword !== confirmPassword) {
      toast.error('Password baru dan konfirmasi tidak cocok.');
      return;
    }

    const result = await changePassword(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success || 'Password berhasil diubah.');
      formRef.current?.reset(); // Kosongkan form setelah sukses
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow-md">
      <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Ganti Password</h4>
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium">Password Saat Ini</label>
        <input type="password" name="currentPassword" id="currentPassword" required className="mt-1 w-full rounded-md border-gray-300"/>
      </div>
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium">Password Baru</label>
        <input type="password" name="newPassword" id="newPassword" required className="mt-1 w-full rounded-md border-gray-300"/>
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium">Konfirmasi Password Baru</label>
        <input type="password" name="confirmPassword" id="confirmPassword" required className="mt-1 w-full rounded-md border-gray-300"/>
      </div>
      <div className="text-right">
        <button type="submit" className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Ubah Password</button>
      </div>
    </form>
  );
}