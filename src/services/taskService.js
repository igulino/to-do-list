import { getPrisma } from '../prisma/client.js';
import { HttpError } from '../utils/httpError.js';
import { validateTaskTitleUniqueness, validateTaskOwnership } from '../validations/taskValidation.js';

export async function createTask({ userId, title, description, status }) {
  await validateTaskTitleUniqueness(userId, title);

  try {
    return await getPrisma().task.create({
      data: { userId, title, description, status },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new HttpError(409, 'Você já possui uma tarefa com este título.');
    }

    throw error;
  }
}

export async function updateTask({ userId, taskId, data }) {
  await validateTaskOwnership(userId, taskId);

  if (data.title !== undefined) {
    await validateTaskTitleUniqueness(userId, data.title, taskId);
  }

  try {
    return await getPrisma().task.update({
      where: { id: taskId, userId },
      data,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new HttpError(409, 'Você já possui uma tarefa com este título.');
    }

    if (error.code === 'P2025') {
      throw new HttpError(404, 'Tarefa não encontrada.');
    }

    throw error;
  }
}

export async function deleteTask({ userId, taskId }) {
  await validateTaskOwnership(userId, taskId);

  try {
    await getPrisma().task.delete({ where: { id: taskId, userId } });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new HttpError(404, 'Tarefa não encontrada.');
    }

    throw error;
  }
}

export async function getTasks({ userId, page, limit, skip }) {
  const prisma = getPrisma();
  const where = { userId };
  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    }),
    prisma.task.count({ where }),
  ]);

  return {
    tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
