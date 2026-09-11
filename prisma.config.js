import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // A geração do client não precisa de uma conexão com o banco.
    url: process.env.DATABASE_URL,
  },
});
