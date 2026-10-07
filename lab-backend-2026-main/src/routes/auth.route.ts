import { Router } from 'express';

const authRoutes = Router();

authRoutes.post('/register', (req, res) => {
  return res.json({ message: 'Rota de registro OK' });
});

authRoutes.post('/login', (req, res) => {
  return res.json({ message: 'Rota de login OK' });
});

export { authRoutes };