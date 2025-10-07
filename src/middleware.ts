// file: middleware.ts (Lokasi: src/middleware.ts)

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// Daftar halaman yang BISA diakses TANPA login
const PUBLIC_PATHS = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Bypass middleware for static assets so they load before login
  // Example: /logo/TIK_POLRI.png, other images, icons, uploads, etc.
  if (
    pathname.startsWith('/logo') ||
    pathname.startsWith('/uploads') ||
    pathname === '/favicon.ico' ||
    /\.(?:png|jpg|jpeg|svg|gif|ico|webp|css|js|map|txt|xml)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 1. ATURAN EKSPLISIT UNTUK HALAMAN UTAMA ('/')
  if (pathname === '/') {
    if (!token) {
      // Jika tidak ada token, paksa ke login
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Jika ada token, verifikasi
    try {
      await jwtVerify(token, JWT_SECRET);
      // Jika token valid, kirim ke dashboard (ini akan ditangkap oleh grup '(app)')
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (e) {
      // Token tidak valid, paksa login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));

  // 2. ATURAN UNTUK HALAMAN PUBLIK (seperti /login)
  if (isPublicPath) {
    if (token) {
       try {
         const { payload } = await jwtVerify(token, JWT_SECRET);
         // Jika sudah login, jangan biarkan di halaman login, kirim ke dashboard
         return NextResponse.redirect(new URL('/dashboard', request.url));
       } catch (error) { /* Token tidak valid, biarkan di halaman login */ }
    }
    return NextResponse.next();
  }

  // 3. ATURAN UNTUK SEMUA HALAMAN TERPROTEKSI LAINNYA
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. VERIFIKASI TOKEN DAN ROLE
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = payload.role as string | undefined;
    const isElevated = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

    if (pathname.startsWith('/admin/users') && userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Jika peran tidak elevated mencoba akses area /admin, tolak
    if (pathname.startsWith('/admin') && !isElevated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

  } catch (error) {
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('token');
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/', // Pastikan '/' ditangkap secara eksplisit
    // Jangan jalankan middleware untuk aset statis seperti /logo
    '/((?!api|_next/static|_next/image|favicon.ico|default-profile.png|uploads|logo).*)',
  ],
};