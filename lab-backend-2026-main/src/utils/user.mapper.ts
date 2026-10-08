import { Role, User } from '@prisma/client';
import { AuthUser, UserRole } from '../types';

export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    username: user.name,
    email: user.email,
    role: user.role as UserRole,
  };
}

export function toPublicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}