import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { GetTasks, CreateTask, UpdateTask, DeleateTask } from '../controllers/taskController.js';
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
protectedRoutes.patch('/:id', UpdateTask);
protectedRoutes.delete('/:id', DeleateTask);
routes.use('/api/tasks', protectedRoutes);

export default routes;
