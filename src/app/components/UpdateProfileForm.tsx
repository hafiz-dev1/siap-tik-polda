// file: app/components/UpdateProfileForm.tsx
'use client';

import { FormEvent, useRef, useState } from 'react';
import { updateProfile } from '@/app/(app)/profile/actions'; // Menggunakan path alias yang benar
import { Pengguna } from '@prisma/client';
import toast from 'react-hot-toast';

export default function UpdateProfileForm({ user }: { user: Pengguna }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [shouldDeletePhoto, setShouldDeletePhoto] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    // Add flag for deleting photo
    if (shouldDeletePhoto) {
      formData.append('deletePhoto', 'true');
    }
    
    // Panggil Server Action
    const result = await updateProfile(formData);
    
    // Tangani respons dari server
    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      toast.success(result.success);
      // Reset states after successful update
      setSelectedFile(null);
      setShouldDeletePhoto(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        event.target.value = '';
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar');
        event.target.value = '';
        return;
      }
      
      setSelectedFile(file);
      setShouldDeletePhoto(false); // Reset delete flag when new file is selected
      toast.success(`Foto "${file.name}" siap diupload. Klik "Simpan Perubahan" untuk menyimpan.`, {
        duration: 4000,
        icon: '📸',
      });
    }
  };

  const handleDeletePhoto = () => {
    setShouldDeletePhoto(true);
    setSelectedFile(null);
    // Clear the file input
    const fileInput = document.getElementById('profilePicture') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    toast.success('Foto profil akan dihapus. Klik "Simpan Perubahan" untuk menyimpan.', {
      duration: 4000,
      icon: '🗑️',
    });
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="relative p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Informasi Profil</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Perbarui informasi personal Anda</p>
          </div>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="space-y-4">
          {/* Nama Lengkap */}
          <div className="group">
            <label
              htmlFor="nama"
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Nama Lengkap</span>
            </label>
            <input
              type="text"
              name="nama"
              id="nama"
              defaultValue={user.nama}
              required
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              placeholder="Masukkan nama lengkap Anda"
            />
          </div>

          {/* Username */}
          <div className="group">
            <label
              htmlFor="username"
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              <span>Username</span>
            </label>
            <input
              type="text"
              name="username"
              id="username"
              defaultValue={user.username}
              required
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              placeholder="Masukkan username unik Anda"
            />
          </div>

          {/* NIP/NRP */}
          <div className="group">
            <label
              htmlFor="nrp_nip"
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-4 0v1m4-1v1" />
              </svg>
              <span>NIP / NRP</span>
            </label>
            <input
              type="text"
              name="nrp_nip"
              id="nrp_nip"
              defaultValue={user.nrp_nip || ''}
              placeholder="Isi NIP atau NRP Anda"
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Nomor Induk Pegawai atau Nomor Register Pokok</p>
          </div>

          {/* Profile Picture */}
          <div className="group">
            <label
              htmlFor="profilePicture"
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Foto Profil</span>
            </label>
            
            {/* Current Photo Preview and Delete Button */}
            {user.profilePictureUrl && !shouldDeletePhoto && (
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.profilePictureUrl}
                      alt="Foto profil saat ini"
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-300 dark:border-blue-700"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Foto profil saat ini</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Klik tombol hapus untuk menghapus foto</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeletePhoto}
                    className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-1 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            )}

            {/* Delete Photo Confirmation */}
            {shouldDeletePhoto && (
              <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.963-1.333-2.732 0L3.084 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm font-medium text-red-900 dark:text-red-200">Foto akan dihapus saat menyimpan</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShouldDeletePhoto(false)}
                    className="px-3 py-1.5 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white text-xs font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {/* Selected File Info */}
            {selectedFile && (
              <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-200">Foto siap diupload</p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Area */}
            <label
              htmlFor="profilePicture"
              className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <div className="flex flex-col items-center justify-center pt-3 pb-3">
                <svg className="w-6 h-6 mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Klik untuk upload foto baru</span>
                </p>
                <p className="text-xs text-gray-400">PNG, JPG (MAX. 5MB)</p>
              </div>
              <input
                type="file"
                name="profilePicture"
                id="profilePicture"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 text-sm cursor-pointer"
          >
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Simpan Perubahan</span>
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
