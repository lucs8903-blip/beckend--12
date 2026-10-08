import { z } from 'zod';
import prisma from '../lib/prisma';
import { Prisma, Role } from '@prisma/client';
import { hashPassword } from '../utils/password';

export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.nativeEnum(Role).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof userSchema>;
type UserFilters = Partial<Pick<User, 'name' | 'email' | 'role'>>;

function removeUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as Partial<T>;
}

export class UserService {
  public async getAllUsers(params: { page?: number; limit?: number; where?: UserFilters; orderBy?: Prisma.UserOrderByWithRelationInput }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, params.limit || 10);
    const where: Prisma.UserWhereInput = params.where
      ? {
          OR: Object.entries(params.where)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => key === 'role'
              ? { role: value as Role }
              : { [key]: { contains: String(value), mode: 'insensitive' } }),
        }
      : {};

    const users = await prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: params.orderBy || { createdAt: 'desc' },
    });
    return users.map(({ password: _password, ...user }) => user);
  }

  public async getUserById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    const { password: _password, ...publicUser } = user;
    return publicUser;
  }

  public async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    const data = userSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(userData);
    const createData: Prisma.UserCreateInput = {
      name: data.name!,
      email: data.email!,
      password: await hashPassword(data.password!),
    };
    if (data.role) createData.role = data.role;
    const user = await prisma.user.create({ data: createData });
    const { password: _password, ...publicUser } = user;
    return publicUser;
  }

  public async updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>) {
    const data = userSchema.partial().omit({ id: true, createdAt: true, updatedAt: true }).parse(userData);
    const updateData: Prisma.UserUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.password !== undefined) updateData.password = await hashPassword(data.password);
    const user = await prisma.user.update({ where: { id }, data: updateData });
    const { password: _password, ...publicUser } = user;
    return publicUser;
  }

  public async deleteUser(id: string): Promise<boolean> {
    await prisma.user.delete({ where: { id } });
    return true;
  }
}