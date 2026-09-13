import { getPrisma } from '../prisma/client.js';
import { HttpError } from '../utils/httpError.js';

export async function validateTaskTitleUniqueness(userId, title, excludeTaskId) {
  const task = await getPrisma().task.findUnique({
    where: { userId_title: { userId, title } },
    select: { id: true },
  });

  if (task && task.id !== excludeTaskId) {
    throw new HttpError(409, 'Você já possui uma tarefa com este título.');
  }
}

export async function validateTaskOwnership(userId, taskId) {
  const task = await getPrisma().task.findUnique({
    where: { id: taskId, userId },
    select: { id: true },
  });

  if (!task) {
    throw new HttpError(404, 'Tarefa não encontrada.');
  }
}
