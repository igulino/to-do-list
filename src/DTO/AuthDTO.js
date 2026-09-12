import { HttpError } from '../utils/httpError.js';

export class LoginDTO {
  constructor(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new HttpError(400, 'Informe email e senha.');
    }

    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';

    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpError(400, 'Informe um email válido.');
    }

    const { password } = input;

    if (typeof password !== 'string' || password.length < 8) {
      throw new HttpError(400, 'A senha deve ter pelo menos 8 caracteres.');
    }

    if (Buffer.byteLength(password, 'utf8') > 72) {
      throw new HttpError(400, 'A senha deve ter no máximo 72 bytes em UTF-8.');
    }

    this.email = email;
    this.password = password;
  }
}

export class AuthDTO extends LoginDTO {
  constructor(input) {
    super(input);

    const name = typeof input.name === 'string' ? input.name.trim() : '';

    if (!name || name.length > 100) {
      throw new HttpError(400, 'O nome deve ter entre 1 e 100 caracteres.');
    }

    this.name = name;
  }
}
