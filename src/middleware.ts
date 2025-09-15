// file: middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // 1. Tangani kasus jika pengguna mencoba akses halaman login
  if (pathname.startsWith('/login')) {
    // Jika sudah punya token valid, jangan biarkan akses halaman login lagi.
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        // Arahkan ke dashboard yang sesuai berdasarkan peran
        const redirectUrl = payload.role === 'ADMIN' ? '/admin/dashboard' : '/';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      } catch (error) {
        // Token tidak valid, izinkan untuk login ulang.
        return NextResponse.next();
      }
    }
    // Jika tidak ada token, izinkan akses ke halaman login.
    return NextResponse.next();
  }

  // 2. Untuk semua halaman LAINNYA, jika tidak ada token, wajib login.
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Jika ADA token, verifikasi dan terapkan aturan otorisasi
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // ATURAN BARU: Jika ADMIN mencoba akses halaman utama, arahkan ke dashboard admin
    if (payload.role === 'ADMIN' && pathname === '/') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // ATURAN LAMA: Jika USER mencoba akses area admin, usir ke halaman utama
    if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }

  } catch (error) {
    // Token tidak valid (kedaluwarsa, dll), paksa login ulang
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('token'); // Hapus cookie yang buruk
    return response;
  }

  // Jika semua pengecekan lolos, izinkan akses.
  return NextResponse.next();
}

export const config = {
  // Regex ini akan menjalankan middleware di SEMUA rute,
  // KECUALI untuk rute internal Next.js dan file-file publik.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|default-profile.png).*)',
  ],
};