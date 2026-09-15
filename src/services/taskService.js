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
  const where = { userId };
  // Mantém os grupos, os totais e as tarefas na mesma versão dos dados.
  return getPrisma().$transaction(async (prisma) => {
    const groups = await prisma.task.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
      orderBy: { status: 'asc' },
    });
    const statuses = groups.slice(skip, skip + limit).map(group => group.status);
    const total = groups.reduce((sum, group) => sum + group._count._all, 0);
    const totalStatuses = groups.length;

    // O limite seleciona status; todas as tarefas desses grupos entram na página.
    const tasks = statuses.length ? await prisma.task.findMany({
      where: { ...where, status: { in: statuses } },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }, { id: 'desc' }],
    }) : [];

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalStatuses,
        totalPages: Math.ceil(totalStatuses / limit),
      },
    };
  }, { isolationLevel: 'RepeatableRead' });
}
