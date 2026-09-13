import { HttpError } from '../utils/httpError.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class TaskIdDTO {
  constructor(taskId, userId) {
    if (typeof userId !== 'string' || !UUID_PATTERN.test(userId)) {
      throw new HttpError(401, 'Token ausente ou inválido.');
    }

    if (typeof taskId !== 'string' || !UUID_PATTERN.test(taskId)) {
      throw new HttpError(400, 'Informe um ID de tarefa válido.');
    }

    this.taskId = taskId.toLowerCase();
    this.userId = userId.toLowerCase();
  }
}
