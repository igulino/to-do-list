import { getPrisma } from '../prisma/client.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { HttpError } from '../utils/httpError.js';

const publicUserFields = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
};

let dummyPasswordHash;

export async function registerUser({ name, email, password }) {
  const passwordHash = await hashPassword(password);

  try {
    return await getPrisma().user.create({
      data: { name, email, passwordHash },
      select: publicUserFields,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new HttpError(409, 'Este email já está cadastrado.');
    }

    throw error;
  }
}

export async function authenticateUser({ email, password }) {
  const user = await getPrisma().user.findUnique({
    where: { email },
    select: { ...publicUserFields, passwordHash: true },
  });

  const passwordHash = user?.passwordHash ?? await (dummyPasswordHash ??= hashPassword('unused-account-password'));
  const matches = await verifyPassword(password, passwordHash);

  if (!user || !matches) {
    throw new HttpError(401, 'Email ou senha inválidos.');
  }

  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}
