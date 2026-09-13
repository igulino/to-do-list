import { getPrisma } from '../prisma/client.js';
import { HttpError } from '../utils/httpError.js';

export async function validateTaskTitleUniqueness(userId, title) {
  const task = await getPrisma().task.findUnique({
    where: { userId_title: { userId, title } },
    select: { id: true },
  });

  if (task) {
    throw new HttpError(409, 'Você já possui uma tarefa com este título.');
  }
}
