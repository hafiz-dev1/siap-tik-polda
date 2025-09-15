// file: lib/session.ts
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { Role } from '@prisma/client'; // Impor tipe Role

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

/**
 * Membaca cookie, memverifikasi token JWT, dan mengembalikan payload.
 * @returns {Promise<{ operatorId: string, role: Role } | null>} Payload berisi ID dan role, atau null.
 */
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Perbarui tipe data di sini untuk menyertakan 'role'
    return payload as { operatorId: string; role: Role; iat: number; exp: number };
  } catch (error) {
    // console.error('Failed to verify session token:', error);
    return null;
  }
}