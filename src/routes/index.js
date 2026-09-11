import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const routes = Router();
const protectedRoutes = Router();

// Rotas públicas.
routes.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

routes.post('/api/auth/register', register);
routes.post('/api/auth/login', login);

// Todas as rotas deste grupo exigem autenticação.
protectedRoutes.use(authMiddleware);

// TODO: registrar o CRUD de tarefas neste grupo: / e /:id.

routes.use('/api/tasks', protectedRoutes);

export default routes;
