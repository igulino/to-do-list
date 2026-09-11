import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getDatabaseUrl } from '../src/config/database.js';

test('aceita os campos DB_* e codifica caracteres especiais nas credenciais', () => {
  const url = new URL(getDatabaseUrl({
    DB_URL: 'localhost', DB_PORT: '5433', DB_USER: 'test@user',
    DB_PASSWORD: 'p@ss:/?#%40', DB_NAME: 'todo', DB_SCHEMA: 'tasks',
  }));
  assert.equal(url.hostname, 'localhost');
  assert.equal(url.port, '5433');
  assert.equal(decodeURIComponent(url.username), 'test@user');
  assert.equal(decodeURIComponent(url.password), 'p@ss:/?#%40');
  assert.equal(url.pathname, '/todo');
  assert.equal(url.searchParams.get('schema'), 'tasks');
});

test('DATABASE_URL tem prioridade sobre os campos separados', () => {
  const DATABASE_URL = 'postgresql://test:pass@localhost/todo?schema=custom';
  assert.equal(getDatabaseUrl({ DATABASE_URL, DB_URL: 'other', DB_NAME: 'other' }), DATABASE_URL);
});

test('preserva opções de uma URL completa em DB_URL', () => {
  const url = new URL(getDatabaseUrl({
    DB_URL: 'postgresql://test:pass@localhost/todo?sslmode=require', DB_SCHEMA: 'custom',
  }));
  assert.equal(url.searchParams.get('sslmode'), 'require');
  assert.equal(url.searchParams.get('schema'), 'custom');
});

test('não inventa conexão quando o ambiente não configura um banco', () => {
  assert.equal(getDatabaseUrl({}), undefined);
  assert.throws(() => getDatabaseUrl({ DB_URL: 'https://localhost' }), /PostgreSQL/);
});
