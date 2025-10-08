'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User2, Settings, LogOut, ChevronDown, Info } from 'lucide-react';

interface User {
  nama: string;
  role: string;
  profilePictureUrl?: string;
}

interface UserDropdownProps {
  user: User;
  onLogout: () => void;
}

export default function UserDropdown({ user, onLogout }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleResize() {
      setIsMobile(window.innerWidth < 640);
    }

    // Initial check
    handleResize();

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'ADMIN':
        return 'Admin';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Image
              src={user.profilePictureUrl || '/default-profile.png'}
              alt={`foto`}
              width={32}
              height={32}
              className="avatar ring-2 ring-gray-200 dark:ring-gray-700"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full"></div>
          </div>
          
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[120px]">
              {user.nama}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {getRoleDisplayName(user.role)}
            </p>
          </div>
        </div>
        
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute mt-2 dropdown-menu rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 z-50 fade-in bg-white dark:bg-gray-800 backdrop-blur-xl ${
          isMobile 
            ? 'right-0 left-0 mx-4 w-auto' 
            : 'right-0 w-64'
        }`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
            <div className="flex items-center space-x-3">
              <Image
                src={user.profilePictureUrl || '/default-profile.png'}
                alt={`foto`}
                width={40}
                height={40}
                className="avatar ring-2 ring-gray-200 dark:ring-gray-600"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user.nama}
                </p>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="py-2 bg-white dark:bg-gray-800">
            <Link
              href="/profile"
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150 rounded-lg mx-1"
              onClick={() => setIsOpen(false)}
            >
              <User2 className="w-4 h-4 mr-3 flex-shrink-0" />
              <span>Profile Saya</span>
            </Link>
            
            <Link
              href="/about"
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150 rounded-lg mx-1"
              onClick={() => setIsOpen(false)}
            >
              <Info className="w-4 h-4 mr-3 flex-shrink-0" />
              <span>Tentang</span>
            </Link>
            
            <Link
              href="/settings"
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150 rounded-lg mx-1"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4 mr-3 flex-shrink-0" />
              <span>Pengaturan</span>
            </Link>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 py-2 bg-white dark:bg-gray-800">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-all duration-150 rounded-lg mx-1"
            >
              <LogOut className="w-4 h-4 mr-3 flex-shrink-0" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
