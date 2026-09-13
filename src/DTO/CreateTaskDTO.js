import { HttpError } from '../utils/httpError.js';

export class CreateTaskDTO {
  constructor(input, userId) {
    if (typeof userId !== 'string' || !userId.trim()) {
      throw new HttpError(401, 'Token ausente ou inválido.');
    }

    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new HttpError(400, 'Informe os dados da tarefa.');
    }

    const title = typeof input.title === 'string' ? input.title.trim() : '';

    if (!title || title.length > 200) {
      throw new HttpError(400, 'O título deve ter entre 1 e 200 caracteres.');
    }

    if (input.description != null && typeof input.description !== 'string') {
      throw new HttpError(400, 'A descrição deve ser um texto.');
    }

    const description = input.description?.trim() || null;
    const status = input.status === undefined ? 'PENDING' : input.status;

    if (typeof status !== 'string' || !status.trim() || status.trim().length > 100) {
      throw new HttpError(400, 'O status deve ter entre 1 e 100 caracteres.');
    }

    this.title = title;
    this.description = description;
    this.status = status.trim();
    this.userId = userId;
  }
}
