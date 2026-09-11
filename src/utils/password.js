import bcrypt from 'bcryptjs';
import { HttpError } from './httpError.js';

const SALT_ROUNDS = 12;

export function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new HttpError(400, 'A senha deve ter pelo menos 8 caracteres.');
  }

  if (Buffer.byteLength(password, 'utf8') > 72) {
    throw new HttpError(400, 'A senha deve ter no máximo 72 bytes em UTF-8.');
  }
}
export async function hashPassword(password) {
  validatePassword(password);
  return bcrypt.hash(password, SALT_ROUNDS);
}
export async function verifyPassword(password, passwordHash) {
  if (typeof password !== 'string' || Buffer.byteLength(password, 'utf8') > 72) {
    return false;
  }
  return bcrypt.compare(password, passwordHash);
}
