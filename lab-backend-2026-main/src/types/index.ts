export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export const USER_ROLE_VALUES = Object.values(UserRole) as [
  UserRole,
  ...UserRole[],
];

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function hasRole(user: Pick<AuthUser, 'role'> | undefined, role: UserRole): boolean {
  return user?.role === role;
}

export function hasAnyRole(
  user: Pick<AuthUser, 'role'> | undefined,
  roles: UserRole[],
): boolean {
  return roles.length === 0 || Boolean(user && roles.includes(user.role));
}