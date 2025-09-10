// file: middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(request: NextRequest) {
  console.log(`\n--- Middleware berjalan untuk path: ${request.nextUrl.pathname} ---`);
  
  const token = request.cookies.get('token')?.value;

  if (!token) {
    console.log('Hasil: Tidak ada token. Mengalihkan ke /login...');
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  console.log('Hasil: Token ditemukan.');

  try {
    await jwtVerify(token, JWT_SECRET);
    console.log('Hasil: Token valid. Melanjutkan ke halaman...');
    return NextResponse.next();
  } catch (error) {
    console.log('Hasil: Token tidak valid. Mengalihkan ke /login...');
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: '/admin/:path*',
};