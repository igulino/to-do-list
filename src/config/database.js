import './env.js';

export function getDatabaseUrl(env = process.env) {
  if (env.DATABASE_URL) return env.DATABASE_URL;
  if (!env.DB_URL) return undefined;

  const url = new URL(env.DB_URL.includes('://') ? env.DB_URL : `postgresql://${env.DB_URL}`);

  if (!['postgresql:', 'postgres:'].includes(url.protocol)) {
    throw new Error('O banco deve usar uma URL PostgreSQL.');
  }

  if (env.DB_PORT) url.port = env.DB_PORT;
  if (env.DB_USER) url.username = encodeURIComponent(env.DB_USER);
  if (env.DB_PASSWORD !== undefined) url.password = encodeURIComponent(env.DB_PASSWORD);
  if (env.DB_NAME) url.pathname = `/${env.DB_NAME}`;
  if (env.DB_SCHEMA) url.searchParams.set('schema', env.DB_SCHEMA);

  return url.toString();
}
