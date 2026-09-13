import { PaginationDTO } from './PaginationDTO.js';
import { HttpError } from '../utils/httpError.js';

export class GetTasksDTO extends PaginationDTO {
  constructor(input, userId) {
    super(input);

    if (typeof userId !== 'string' || !userId.trim()) {
      throw new HttpError(401, 'Token ausente ou inválido.');
    }

    this.userId = userId;
  }
}
