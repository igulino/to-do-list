import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/index.js';
import { getDatabaseUrl } from '../config/database.js';

let prisma;

export function getPrisma() {
  if (!prisma) {
    const connectionString = getDatabaseUrl();

    if (!connectionString) {
      throw new Error('Configure DATABASE_URL ou os campos DB_* no .env.');
    }

    const schema = new URL(connectionString).searchParams.get('schema') || 'public';
    const adapter = new PrismaPg({ connectionString }, { schema });
    prisma = new PrismaClient({ adapter });
  }

  return prisma;
}
