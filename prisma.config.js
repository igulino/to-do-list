import './src/config/env.js';
import { defineConfig } from 'prisma/config';
import { getDatabaseUrl } from './src/config/database.js';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.js',
  },
  datasource: {
    // A geração do client não precisa de uma conexão com o banco.
    url: getDatabaseUrl(),
  },
});
