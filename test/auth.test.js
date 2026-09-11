import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import bcrypt from 'bcryptjs';
import { getPrisma } from '../src/prisma/client.js';
import { registerUser, authenticateUser } from '../src/services/authService.js';
import { hashPassword, verifyPassword } from '../src/utils/password.js';

process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
const prisma = getPrisma();
const password = 'senha de teste segura';
const publicUser = {
  id: 'f7f19537-4375-4b5c-af37-7178a7430c1b',
  name: 'Pessoa Teste',
  email: 'teste@example.com',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};
let passwordHash;

function mockPrisma(t, method, implementation) {
  const original = prisma.user[method];
  const mocked = t.mock.fn(implementation);
  prisma.user[method] = mocked;
  t.after(() => { prisma.user[method] = original; });
  return mocked;
}

before(async () => { passwordHash = await hashPassword(password); });
after(async () => { await prisma.$disconnect(); });

test('bcrypt usa custo 12, salt individual e confere a senha', async () => {
  const otherHash = await hashPassword(password);
  assert.equal(bcrypt.getRounds(passwordHash), 12);
  assert.notEqual(passwordHash, password);
  assert.notEqual(passwordHash, otherHash);
  assert.equal(await verifyPassword(password, passwordHash), true);
  assert.equal(await verifyPassword('senha incorreta', passwordHash), false);
});

test('bcrypt rejeita truncamento de senhas em UTF-8', async () => {
  const boundary = 'á'.repeat(36);
  const boundaryHash = await hashPassword(boundary);
  assert.equal(await verifyPassword(boundary, boundaryHash), true);
  await assert.rejects(hashPassword(boundary + 'a'), { status: 400 });
  assert.equal(await verifyPassword(boundary + 'a', boundaryHash), false);
  await assert.rejects(hashPassword('curta'), { status: 400 });
});

test('cadastro normaliza dados e envia somente o hash ao Prisma', async (t) => {
  mockPrisma(t, 'create', async ({ data, select }) => {
    assert.equal(data.name, publicUser.name);
    assert.equal(data.email, publicUser.email);
    assert.equal(Object.hasOwn(data, 'password'), false);
    assert.equal(await verifyPassword(password, data.passwordHash), true);
    assert.equal(select.passwordHash, undefined);
    return publicUser;
  });

  const user = await registerUser({
    name: '  Pessoa Teste  ', email: '  TESTE@example.com  ', password,
  });
  assert.deepEqual(user, publicUser);
  assert.equal(Object.hasOwn(user, 'passwordHash'), false);
});

test('cadastro rejeita dados inválidos antes de consultar o banco', async (t) => {
  const create = mockPrisma(t, 'create', async () => {});
  for (const input of [
    null,
    [],
    { name: '', email: publicUser.email, password },
    { name: 'a'.repeat(101), email: publicUser.email, password },
    { name: publicUser.name, email: 'invalido', password },
    { name: publicUser.name, email: publicUser.email, password: 'curta' },
  ]) {
    await assert.rejects(registerUser(input), { status: 400 });
  }
  assert.equal(create.mock.callCount(), 0);
});

test('cadastro trata conflito de email no banco', async (t) => {
  mockPrisma(t, 'create', async () => {
    throw Object.assign(new Error('unique constraint'), { code: 'P2002' });
  });
  await assert.rejects(registerUser({ ...publicUser, password }), { status: 409 });
});

test('autenticação confere o hash e retorna o usuário sem a senha', async (t) => {
  mockPrisma(t, 'findUnique', async ({ where }) => {
    assert.equal(where.email, publicUser.email);
    return { ...publicUser, passwordHash };
  });
  assert.deepEqual(await authenticateUser({ email: 'TESTE@example.com', password }), publicUser);
});

test('autenticação rejeita uma senha incorreta', async (t) => {
  mockPrisma(t, 'findUnique', async () => ({ ...publicUser, passwordHash }));
  await assert.rejects(authenticateUser({ email: publicUser.email, password: 'senha incorreta' }), {
    status: 401, message: 'Email ou senha inválidos.',
  });
});

test('autenticação usa a mesma resposta para um email inexistente', async (t) => {
  mockPrisma(t, 'findUnique', async () => null);
  await assert.rejects(authenticateUser({ email: publicUser.email, password }), {
    status: 401, message: 'Email ou senha inválidos.',
  });
});
