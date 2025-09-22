'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield, FileText, Users, Trash2, LayoutDashboard, Info } from 'lucide-react';
import UserDropdown from './UserDropdown';
import ThemeSwitcher from './ThemeSwitcher';

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
      href: '/about',
      label: 'Tentang',
      icon: <Info className="w-4 h-4" />,
    },
    {
      href: '/admin/users',
      label: 'Manajemen Pengguna',
      icon: <Users className="w-4 h-4" />,
      adminOnly: true,
    },
    {
      href: '/admin/trash',
      label: 'Tempat Sampah',
      icon: <Trash2 className="w-4 h-4" />,
      adminOnly: true,
    },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.adminOnly || user.role === 'ADMIN'
  );

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 border-b navbar-blur" 
         style={{ 
           backgroundColor: 'var(--navbar-bg)',
           borderColor: 'var(--navbar-border)',
           boxShadow: 'var(--navbar-shadow)',
           height: 'var(--navbar-height)'
         }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4 md:space-x-6 lg:space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-3 group">
              <img
                src="/logo/TIK_POLRI_navbar.png"
                alt="TIK POLRI Logo"
                className="w-8 h-8 object-contain transition-transform duration-1500 group-hover:rotate-y-360"
              />
              <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                S I A P
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1 hidden lg:block">
                Sistem Informasi Arsip POLDA
              </p>
              </div>
            </Link>

            {/* Desktop Navigation - Show on medium screens and up */}
            <div className="hidden md:flex md:space-x-1">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  data-tooltip={item.label}
                  className={`nav-item flex items-center space-x-2 ${
                    isActiveLink(item.href) ? 'active' : ''
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
            {/* <ThemeSwitcher /> // dark mode toggle */}
            <UserDropdown user={user} onLogout={onLogout} />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* <ThemeSwitcher /> {/* dark mode toggle */}
            <button
              type="button"
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100/80 dark:text-gray-400 dark:hover:bg-gray-800/80 transition-all duration-200 backdrop-blur-sm hover:backdrop-blur-md"
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
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 navbar-blur animate-in slide-in-from-top-2 duration-200"
             style={{ 
               backgroundColor: 'var(--navbar-bg)',
               borderColor: 'var(--navbar-border)',
               backdropFilter: 'blur(var(--navbar-backdrop-blur))',
               WebkitBackdropFilter: 'blur(var(--navbar-backdrop-blur))'
             }}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* User info section for mobile */}
            <div className="px-3 py-3 border-b border-gray-200 dark:border-gray-700 mb-2 backdrop-blur-sm bg-white/5 dark:bg-gray-800/5 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.nama.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.nama}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.role === 'ADMIN' ? 'Administrator' : 'Pengguna'}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation items */}
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 backdrop-blur-sm ${
                  isActiveLink(item.href)
                    ? 'bg-blue-50/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:backdrop-blur-md'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Mobile logout */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
              <Link
                href="/profile"
                className="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 backdrop-blur-sm hover:backdrop-blur-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Shield className="w-4 h-4" />
                <span>Profile Saya</span>
              </Link>
              
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="flex items-center space-x-3 w-full px-3 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/30 transition-all duration-200 backdrop-blur-sm hover:backdrop-blur-md"
              >
                <X className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
