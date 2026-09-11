import { HttpError } from '../utils/httpError.js';
import { validatePassword } from '../utils/password.js';

export function validateLoginInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new HttpError(400, 'Informe email e senha.');
  }

  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'Informe um email válido.');
  }

  validatePassword(input.password);
  return { email, password: input.password };
}

export function validateRegisterInput(input) {
  const credentials = validateLoginInput(input);
  const name = typeof input.name === 'string' ? input.name.trim() : '';

  if (!name || name.length > 100) {
    throw new HttpError(400, 'O nome deve ter entre 1 e 100 caracteres.');
  }

  return { name, ...credentials };
}
