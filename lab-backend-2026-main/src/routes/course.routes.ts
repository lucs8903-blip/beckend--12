    
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const courseRoutes = Router();


courseRoutes.post(
  '/',
  authenticate,
  authorize(['TEACHER', 'ADMIN']),
  async (req: Request, res: Response) => {
    const courseSchema = z.object({
      title: z.string().min(3),
      description: z.string().optional(),
    });

    try {
      const { title, description } = courseSchema.parse(req.body);

      const course = await prisma.course.create({
        data: {
          title,
          description,
          teacherId: req.user.id,
        },
      });

      return res.status(201).json(course);
    } catch (error) {
      return res.status(400).json({ error: 'Erro ao criar o curso' });
    }
  }
);


courseRoutes.post(
  '/:courseId/enroll',
  authenticate,
  authorize(['STUDENT']),
  async (req: Request, res: Response) => {
    const { courseId } = req.params;

    try {
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: req.user.id,
          courseId,
        },
      });

      return res.status(201).json(enrollment);
    } catch (error) {
      return res.status(400).json({ error: 'Aluno já matriculado ou curso inexistente' });
    }
  }
);

export { courseRoutes };