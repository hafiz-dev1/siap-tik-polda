// file: lib/session.ts
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Kunci rahasia yang sama dengan yang ada di .env
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

/**
 * Membaca cookie, memverifikasi token JWT, dan mengembalikan payload.
 * @returns {Promise<{ operatorId: string } | null>} Payload berisi ID operator, atau null jika tidak valid.
 */
export async function getSession() {
  const cookieStore = await cookies(); // <-- FIX: Added 'await'
  const token = cookieStore.get('token')?.value;
  
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { operatorId: string; iat: number; exp: number };
  } catch (error) {
    console.error('Failed to verify session token:', error);
    return null;
  }
}