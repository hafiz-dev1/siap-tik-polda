// file: app/admin/layout.tsx

import { logout } from './actions'; // <-- 1. Impor fungsi logout

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 2. Fungsi handleLogout yang lama sudah dihapus dari sini

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="font-bold text-xl text-gray-800">
                SIAD POLDA - Admin
              </span>
            </div>
            <div className="flex items-center">
              {/* 3. Form sekarang memanggil fungsi logout yang diimpor */}
              <form action={logout}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}