import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { GetTasks, CreateTask } from '../controllers/taskController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const routes = Router();
const protectedRoutes = Router();

// Rotas públicas.
routes.post('/api/auth/register', register);
routes.post('/api/auth/login', login);

// Rotas privadas.
protectedRoutes.use(authMiddleware);
protectedRoutes.get('/', GetTasks);
protectedRoutes.post('/', CreateTask);
// TODO: registrar atualização e exclusão de tarefas neste grupo.
routes.use('/api/tasks', protectedRoutes);

export default routes;
