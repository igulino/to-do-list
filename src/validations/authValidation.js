import { getPrisma } from '../prisma/client.js';
import { HttpError } from '../utils/httpError.js';

export async function validateEmailUniqueness(email) {
  const user = await getPrisma().user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (user) {
    throw new HttpError(409, 'Este email já está cadastrado.');
  }
}
