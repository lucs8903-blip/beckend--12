import { Role } from '@prisma/client';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { comparePasswords, hashPassword } from '../utils/password';
import { toAuthUser, toPublicUser } from '../utils/user.mapper';
import { signToken } from '../utils/jwt';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  role: z.enum([Role.STUDENT, Role.TEACHER]).default(Role.STUDENT),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export class AuthService {
  public async register(input: RegisterInput) {
    const data = registerSchema.parse(input);
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new Error('E-mail já cadastrado');

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: await hashPassword(data.password),
        role: data.role,
      },
    });
    return { token: signToken(toAuthUser(user)), user: toPublicUser(user) };
  }

  public async login(input: LoginInput) {
    const credentials = loginSchema.parse(input);
    const user = await prisma.user.findUnique({ where: { email: credentials.email } });
    if (!user || !(await comparePasswords(credentials.password, user.password))) {
      throw new Error('E-mail ou senha inválidos');
    }
    return { token: signToken(toAuthUser(user)), user: toPublicUser(user) };
  }

  public async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuário não encontrado');
    return toPublicUser(user);
  }
}