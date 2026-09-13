import { HttpError } from '../utils/httpError.js';

export class PaginationDTO {
  constructor(input = {}) {
    const rawPage = input.page ?? '1';
    const page = Number(rawPage);
    const limit = 5;
    const skip = (page - 1) * limit;

    if (typeof rawPage !== 'string' || !/^[1-9]\d*$/.test(rawPage)
      || !Number.isSafeInteger(page) || skip > 2_147_483_647) {
      throw new HttpError(400, 'Informe uma página válida.');
    }

    this.page = page;
    this.limit = limit;
    this.skip = skip;
  }
}
