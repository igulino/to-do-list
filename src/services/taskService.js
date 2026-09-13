import { getPrisma } from '../prisma/client.js';
import { HttpError } from '../utils/httpError.js';
import { validateTaskTitleUniqueness } from '../validations/taskValidation.js';

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
