// file: app/(app)/about/page.tsx
import { Shield, Users, FileText, Target, Award, Clock } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Tentang S I A P
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Sistem Informasi Arsip POLDA (SIAP) adalah platform modern untuk mengelola 
          dan mengarsipkan surat disposisi secara digital dengan aman dan efisien.
        </p>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <Target className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Visi</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Menjadi sistem arsip digital terdepan yang mendukung transparansi, efisiensi, 
            dan akuntabilitas dalam pengelolaan dokumen di lingkungan Kepolisian Daerah.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <Award className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Misi</h2>
          </div>
          <ul className="text-gray-600 dark:text-gray-300 space-y-2">
            <li>• Digitalisasi sistem kearsipan untuk meningkatkan efisiensi</li>
            <li>• Menjamin keamanan dan integritas data dokumen</li>
            <li>• Mempermudah akses dan pencarian dokumen</li>
            <li>• Mendukung paperless office dan ramah lingkungan</li>
          </ul>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          Fitur Utama
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Manajemen Arsip
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Kelola surat masuk dan keluar dengan sistem kategorisasi yang terstruktur
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Keamanan Data
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Sistem autentikasi dan autorisasi berlapis untuk melindungi data sensitif
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Multi-User
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Sistem role-based access dengan manajemen pengguna yang fleksibel
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8 border border-blue-200 dark:border-gray-600">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          Teknologi yang Digunakan
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm border border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white">Frontend</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Next.js 15, React, TypeScript, Tailwind CSS
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm border border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white">Backend</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              Next.js API Routes, Server Components
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm border border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white">Database</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              PostgreSQL, Prisma ORM
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm border border-gray-200 dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white">Security</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              JWT Authentication, RBAC
            </p>
          </div>
        </div>
      </div>

      {/* Development Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Informasi Pengembangan</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Status Proyek</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Sistem ini dikembangkan sebagai bagian dari program modernisasi 
              administrasi kepolisian untuk meningkatkan efisiensi dan transparansi.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Versi</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Version 1.0.0 - Sistem telah melalui tahap pengujian dan siap untuk 
              implementasi di lingkungan produksi.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
          Bantuan & Dukungan
        </h2>
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Untuk bantuan teknis atau pertanyaan mengenai sistem, silakan hubungi 
            Administrator TIK POLDA.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2025 SIAD TIK POLDA. Sistem ini dikembangkan untuk internal Kepolisian Daerah.
          </p>
        </div>
      </div>
    </div>
  );
}