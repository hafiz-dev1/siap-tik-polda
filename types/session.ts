// types/session.ts
import { Role } from '@prisma/client';

/**
 * Session type untuk JWT payload
 */
export interface Session {
  operatorId: string;
  role: Role;
  username: string;
  nama: string;
  iat: number;
  exp: number;
}
