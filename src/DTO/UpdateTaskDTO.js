import { TaskIdDTO } from './TaskIdDTO.js';
import { HttpError } from '../utils/httpError.js';

export class UpdateTaskDTO extends TaskIdDTO {
  constructor(input, taskId, userId) {
    super(taskId, userId);

    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new HttpError(400, 'Informe os dados da tarefa.');
    }

    const data = {};

    if (Object.hasOwn(input, 'title')) {
      const title = typeof input.title === 'string' ? input.title.trim() : '';

      if (!title || title.length > 200) {
        throw new HttpError(400, 'O título deve ter entre 1 e 200 caracteres.');
      }

      data.title = title;
    }

    if (Object.hasOwn(input, 'description')) {
      if (input.description !== null && typeof input.description !== 'string') {
        throw new HttpError(400, 'A descrição deve ser um texto.');
      }

      data.description = input.description?.trim() || null;
    }

    if (Object.hasOwn(input, 'status')) {
      const status = typeof input.status === 'string' ? input.status.trim() : '';

      if (!status || status.length > 100) {
        throw new HttpError(400, 'O status deve ter entre 1 e 100 caracteres.');
      }

      data.status = status;
    }

    if (Object.keys(data).length === 0) {
      throw new HttpError(400, 'Informe título, descrição ou status para atualizar.');
    }

    this.data = data;
  }
}
