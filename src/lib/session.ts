// file: lib/session.ts
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { Role } from '@prisma/client'; // Impor tipe Role
import type { Session } from '../../types/session';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

/**
 * Membaca cookie, memverifikasi token JWT, dan mengembalikan payload.
 * @returns {Promise<Session | null>} Payload berisi ID, role, username, dan nama, atau null.
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Perbarui tipe data di sini untuk menyertakan 'role', 'username', dan 'nama'
    return payload as unknown as Session;
  } catch (error) {
    // console.error('Failed to verify session token:', error);
    return null;
  }
}