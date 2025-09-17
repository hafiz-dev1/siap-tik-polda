'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Role } from '@prisma/client';
import { motion } from 'framer-motion';

type NavbarLinksProps = {
  userRole: Role;
};

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', allowedRoles: ['ADMIN', 'OPERATOR'] },
  { href: '/arsip', label: 'Arsip Surat', allowedRoles: ['ADMIN', 'OPERATOR'] },
  { href: '/admin/users', label: 'Manajemen Pengguna', allowedRoles: ['ADMIN'] },
  { href: '/admin/trash', label: 'Tempat Sampah', allowedRoles: ['ADMIN'] },
];

export default function NavbarLinks({ userRole }: NavbarLinksProps) {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:items-center md:space-x-6">
      {navLinks
        .filter((link) => link.allowedRoles.includes(userRole))
        .map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              {link.label}
            </Link>
          );
        })}
    </div>
  );
}
