'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield, FileText, Users, Trash2, LayoutDashboard, Activity, Info } from 'lucide-react';
import UserDropdown from './UserDropdown';
import { useChromeOptimizations } from '@/app/hooks/useBrowserDetection';

interface User {
  nama: string;
  role: string;
  profilePictureUrl?: string;
}

interface ModernNavbarProps {
  user: User;
  onLogout: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

export default function ModernNavbar({ user, onLogout }: ModernNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isChrome, shouldUseBackdropFilter, optimizationClass } = useChromeOptimizations();

  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      href: '/arsip',
      label: 'Arsip Surat',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      href: '/admin/users',
      label: 'Pengguna',
      icon: <Users className="w-4 h-4" />,
      adminOnly: true,
    },
    {
      href: '/admin/trash',
      label: 'Kotak Sampah',
      icon: <Trash2 className="w-4 h-4" />,
      adminOnly: true,
    },
  ];

  const isPrivileged = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  const filteredNavItems = navItems.filter(item => 
    !item.adminOnly || isPrivileged
  );

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b navbar-blur w-full"
      style={{
        backgroundColor: 'var(--navbar-bg)',
        borderColor: 'var(--navbar-border)',
        boxShadow: 'var(--navbar-shadow)',
        height: 'var(--navbar-height)',
      }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 md:space-x-6 lg:space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <img
                src="/logo/TIK_POLRI_navbar.png"
                alt="TIK POLRI Logo"
                className="w-8 h-8 object-contain transition-all duration-2000 group-hover:rotate-y-360"
                style={{ transformStyle: 'preserve-3d' }}
              />
              <div className="block">
                <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">
                  S I A P
                </h1>
                <p className="text-xs text-gray-500 -mt-1 hidden lg:block">
                  Sistem Informasi Arsip Polda
                </p>
              </div>
            </Link>
          </div>

          {/* Centered Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center space-x-2">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  data-tooltip={item.label}
                  className={`nav-item flex items-center space-x-2 px-4 py-2 min-w-[140px] justify-center rounded-lg transition-all duration-200 ${
                    isActiveLink(item.href)
                      ? 'active bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium'
                  }`}
                >
                  {item.icon}
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side - Desktop and Medium screens */}
          <div className="hidden md:flex md:items-center md:space-x-3 lg:space-x-4">
            <UserDropdown user={user} onLogout={onLogout} />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              type="button"
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 bg-gray-100/50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-700 cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded="false"
            >
              <span className="sr-only">Buka menu utama</span>
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden border-t navbar-blur"
          style={{
            backgroundColor: 'var(--navbar-bg)',
            borderColor: 'var(--navbar-border)',
            boxShadow: 'var(--navbar-shadow)',
            backdropFilter: 'blur(2px)', // blur halus
          }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* User info section for mobile - Compact */}
            <div className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 mb-2 bg-gray-100/30 dark:bg-gray-800/30 rounded-md backdrop-blur-[1px]">
              <div className="flex items-center space-x-2.5">
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={`foto ${user.nama}`}
                    className="w-9 h-9 rounded-md object-cover ring-2 ring-blue-200 dark:ring-blue-700 shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-md flex items-center justify-center shadow-sm">
                    <span className="text-white text-sm font-bold">
                      {user.nama.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{user.nama}</p>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    {user.role === 'SUPER_ADMIN'
                      ? 'Super Admin'
                      : user.role === 'ADMIN'
                      ? 'Admin'
                      : user.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation items - Compact */}
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2.5 px-4 py-3 rounded-md text-sm font-semibold transition-all duration-200 ${
                  isActiveLink(item.href)
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 bg-gray-100/30 dark:bg-gray-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}

            {/* User Menu - Grid 2 Columns for compact layout */}
            <div className="pt-2 border-t-2 border-gray-200 dark:border-gray-700 mt-2">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <Link
                  href="/profile"
                  className={`flex flex-col items-center justify-center px-3 py-3 rounded-md text-sm font-semibold transition-all duration-200 border cursor-pointer ${
                    pathname === '/profile'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                      : 'text-gray-700 dark:text-gray-300 bg-gray-100/30 dark:bg-gray-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Shield className="w-5 h-5 mb-1.5" />
                  <span className="text-xs">Profile</span>
                </Link>

                <Link
                  href="/log-activity"
                  className={`flex flex-col items-center justify-center px-3 py-3 rounded-md text-sm font-semibold transition-all duration-200 border cursor-pointer ${
                    pathname === '/log-activity'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                      : 'text-gray-700 dark:text-gray-300 bg-gray-100/30 dark:bg-gray-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Activity className="w-5 h-5 mb-1.5" />
                  <span className="text-xs">Log</span>
                </Link>

                <Link
                  href="/about"
                  className={`flex flex-col items-center justify-center px-3 py-3 rounded-md text-sm font-semibold transition-all duration-200 border cursor-pointer ${
                    pathname === '/about'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                      : 'text-gray-700 dark:text-gray-300 bg-gray-100/30 dark:bg-gray-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Info className="w-5 h-5 mb-1.5" />
                  <span className="text-xs">Tentang</span>
                </Link>
              </div>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-md text-sm font-semibold text-white bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 transition-all duration-200 shadow-md cursor-pointer"
              >
                <X className="w-5 h-5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
