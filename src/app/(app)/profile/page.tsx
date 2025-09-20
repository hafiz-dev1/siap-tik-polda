// file: app/(app)/profile/page.tsx

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Image from "next/image";
import UpdateProfileForm from "@/app/components/UpdateProfileForm";
import ChangePasswordForm from "@/app/components/ChangePasswordForm";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect('/login'); // Seharusnya tidak terjadi berkat middleware, tapi sebagai pengaman
  }

  const user = await prisma.pengguna.findUnique({
    where: { id: session.operatorId }
  });

  if (!user) {
    return <p>Pengguna tidak ditemukan.</p>;
  }

  return (
    <div className="space-y-8">
      <div className="border-b pb-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
      </div>
      
      {/* Kartu Info Pengguna */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-lg shadow-md">
        <Image
          src={user.profilePictureUrl || '/default-profile.png'}
          alt="Foto profile"
          width={100}
          height={100}
          className="rounded-full object-cover border-4 border-indigo-100"
        />
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">{user.nama}</h2>
          <p className="text-gray-600">{user.username}</p>
          <p className="text-gray-600">{user.nrp_nip || 'NIP/NRP belum diisi'}</p>
          <span 
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              user.role === 'ADMIN'
                ? 'bg-blue-100 text-blue-800' // Tampilan warna biru untuk ADMIN
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {user.role === 'ADMIN' ? 'Administrator' : 'User Biasa'}
          </span>
        </div>
      </div>

      {/* Grid untuk Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <UpdateProfileForm user={user} />
        <ChangePasswordForm />
      </div>
    </div>
  );
}