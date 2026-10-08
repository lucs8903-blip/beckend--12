import { Router } from 'express';
import userRoutes from './user.route';
import { authRoutes } from './auth.route';
import { courseRoutes } from './course.routes';

const routes = Router();

routes.use('/users', userRoutes);
routes.use('/auth', authRoutes);
routes.use('/courses', courseRoutes);

routes.get('/', (_req, res) => {
  res.json({ message: 'Educational API - Node.js + Express + TypeScript' });
});

export default routes;