import { Prisma } from '@prisma/client';
import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

const courseRoutes = Router();
const courseSchema = z.object({ title: z.string().min(3), description: z.string().min(3).optional() });
const getCourseId = (req: Request) => typeof req.params.courseId === 'string' ? req.params.courseId : undefined;

courseRoutes.use(authenticate);

courseRoutes.get('/', async (_req: Request, res: Response) => {
  const courses = await prisma.course.findMany({
    include: { teacher: { select: { id: true, name: true, email: true } }, _count: { select: { enrollments: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(courses);
});

courseRoutes.get('/my', async (req: Request, res: Response) => {
  if (req.user!.role === UserRole.TEACHER) {
    const courses = await prisma.course.findMany({
      where: { teacherId: req.user!.id },
      include: { _count: { select: { enrollments: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(courses);
    return;
  }
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: req.user!.id },
    include: { course: { include: { teacher: { select: { id: true, name: true, email: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(enrollments.map((enrollment) => enrollment.course));
});

courseRoutes.get('/:courseId', async (req: Request, res: Response) => {
  const courseId = getCourseId(req);
  if (!courseId) { res.status(400).json({ error: 'Curso invalido' }); return; }
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { teacher: { select: { id: true, name: true, email: true } }, _count: { select: { enrollments: true } } },
  });
  if (!course) { res.status(404).json({ error: 'Curso nao encontrado' }); return; }
  res.json(course);
});

courseRoutes.post('/', authorize([UserRole.TEACHER, UserRole.ADMIN]), async (req: Request, res: Response) => {
  try {
    const { title, description } = courseSchema.parse(req.body);
    const course = await prisma.course.create({ data: { title, ...(description !== undefined ? { description } : {}), teacherId: req.user!.id } });
    res.status(201).json(course);
  } catch { res.status(400).json({ error: 'Dados do curso invalidos' }); }
});

courseRoutes.patch('/:courseId', authorize([UserRole.TEACHER, UserRole.ADMIN]), async (req: Request, res: Response) => {
  try {
    const courseId = getCourseId(req);
    if (!courseId) { res.status(400).json({ error: 'Curso invalido' }); return; }
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) { res.status(404).json({ error: 'Curso nao encontrado' }); return; }
    if (req.user!.role !== UserRole.ADMIN && course.teacherId !== req.user!.id) {
      res.status(403).json({ error: 'Voce so pode editar os seus cursos' }); return;
    }
    const parsed = courseSchema.partial().parse(req.body);
    const data: Prisma.CourseUpdateInput = {};
    if (parsed.title !== undefined) data.title = parsed.title;
    if (parsed.description !== undefined) data.description = parsed.description;
    res.json(await prisma.course.update({ where: { id: course.id }, data }));
  } catch { res.status(400).json({ error: 'Dados do curso invalidos' }); }
});

courseRoutes.delete('/:courseId', authorize([UserRole.TEACHER, UserRole.ADMIN]), async (req: Request, res: Response) => {
  const courseId = getCourseId(req);
  if (!courseId) { res.status(400).json({ error: 'Curso invalido' }); return; }
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) { res.status(404).json({ error: 'Curso nao encontrado' }); return; }
  if (req.user!.role !== UserRole.ADMIN && course.teacherId !== req.user!.id) {
    res.status(403).json({ error: 'Voce so pode excluir os seus cursos' }); return;
  }
  await prisma.course.delete({ where: { id: course.id } });
  res.status(204).send();
});

courseRoutes.post('/:courseId/enroll', authorize([UserRole.STUDENT]), async (req: Request, res: Response) => {
  const courseId = getCourseId(req);
  if (!courseId) { res.status(400).json({ error: 'Curso invalido' }); return; }
  try {
    const enrollment = await prisma.enrollment.create({ data: { userId: req.user!.id, courseId } });
    res.status(201).json(enrollment);
  } catch { res.status(400).json({ error: 'Matricula ja existe ou curso nao foi encontrado' }); }
});

courseRoutes.delete('/:courseId/enroll', authorize([UserRole.STUDENT]), async (req: Request, res: Response) => {
  const courseId = getCourseId(req);
  if (!courseId) { res.status(400).json({ error: 'Curso invalido' }); return; }
  try {
    await prisma.enrollment.delete({ where: { userId_courseId: { userId: req.user!.id, courseId } } });
    res.status(204).send();
  } catch { res.status(404).json({ error: 'Matricula nao encontrada' }); }
});

export { courseRoutes };