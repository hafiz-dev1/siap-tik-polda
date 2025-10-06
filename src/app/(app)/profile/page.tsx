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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Pengguna Tidak Ditemukan</h2>
          <p className="text-gray-600 dark:text-gray-400">Maaf, data pengguna tidak dapat ditemukan dalam sistem.</p>
        </div>
      </div>
    );
  }

  const normalizedRole = user.role as string;
  const isSuperAdmin = normalizedRole === 'SUPER_ADMIN';
  const isAdmin = normalizedRole === 'ADMIN';
  const roleBadgeClasses = isSuperAdmin
    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/30'
    : isAdmin
      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/25'
      : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-gray-500/25';
  const roleLabel = isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin' : normalizedRole;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Profil Saya
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola informasi dan pengaturan akun Anda</p>
            </div>
          </div>
        </div>
        
        {/* Profile Overview Card */}
        <div className="mb-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
            <div className="relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-10"></div>
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
              
              <div className="relative p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                  {/* Profile Picture */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                    <div className="relative">
                      <Image
                        src={user.profilePictureUrl || '/default-profile.png'}
                        alt="Foto profile"
                        width={120}
                        height={120}
                        className="rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-xl"
                      />
                      <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-2 border-white dark:border-gray-700 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 text-center lg:text-left space-y-4">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {user.nama}
                      </h2>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center justify-center lg:justify-start gap-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                          <span className="font-medium">@{user.username}</span>
                        </div>
                        <div className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="flex items-center justify-center lg:justify-start gap-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-4 0v1m4-1v1" />
                          </svg>
                          <span>{user.nrp_nip || 'NIP/NRP belum diisi'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Role Badge */}
                    <div className="flex justify-center lg:justify-start">
                      <span 
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${roleBadgeClasses}`}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {isSuperAdmin ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          ) : isAdmin ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          )}
                        </svg>
                        {roleLabel}
                      </span>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                      <div className="grid grid-cols-2 gap-6 text-center lg:text-left">
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {new Date(user.createdAt).toLocaleDateString('id-ID', { year: 'numeric' })}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Tahun Bergabung</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">Aktif</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Status Akun</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Forms Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <UpdateProfileForm user={user} />
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}