import jwt from 'jsonwebtoken';
import { AuthUser, UserRole } from '../types';

export type JwtPayload = { sub: string; email: string; role: UserRole };

export function signToken(user: Pick<AuthUser, 'id' | 'email' | 'role'>): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'default_secret_key',
    { expiresIn: Number(process.env.JWT_EXPIRES_IN) || 3600 },
  );
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
  if (typeof decoded === 'string' || !decoded || typeof decoded !== 'object') throw new Error('Invalid token');

  const payload = decoded as Partial<JwtPayload>;
  if (!payload.sub || !payload.email || !payload.role || !Object.values(UserRole).includes(payload.role)) {
    throw new Error('Invalid token payload');
  }
  return { sub: payload.sub, email: payload.email, role: payload.role };
}