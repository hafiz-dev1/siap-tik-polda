// file: app/components/UpdateProfileForm.tsx
'use client';

import { FormEvent, useRef } from 'react';
import { updateProfile } from '@/app/(app)/profile/actions';
import { Pengguna } from '@prisma/client';
import toast from 'react-hot-toast';

export default function UpdateProfileForm({ user }: { user: Pengguna }) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const result = await updateProfile(formData);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.success || 'Profil berhasil diperbarui!');
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow-md">
      <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Informasi Profil</h4>
      <div>
        <label htmlFor="nama" className="block text-sm font-medium">Nama Lengkap</label>
        <input type="text" name="nama" id="nama" defaultValue={user.nama} required className="mt-1 w-full rounded-md border-gray-300"/>
      </div>
      <div>
        <label htmlFor="username" className="block text-sm font-medium">Username</label>
        <input type="text" name="username" id="username" defaultValue={user.username} required className="mt-1 w-full rounded-md border-gray-300"/>
      </div>
      <div>
        <label htmlFor="nrp_nip" className="block text-sm font-medium">NIP / NRP</label>
        <input type="text" name="nrp_nip" id="nrp_nip" defaultValue={user.nrp_nip || ''} className="mt-1 w-full rounded-md border-gray-300"/>
      </div>
      <div>
        <label htmlFor="profilePicture" className="block text-sm font-medium">Foto Profil Baru</label>
        <input type="file" name="profilePicture" id="profilePicture" accept="image/*" className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0"/>
      </div>
      <div className="text-right">
        <button type="submit" className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Simpan Perubahan</button>
      </div>
    </form>
  );
}