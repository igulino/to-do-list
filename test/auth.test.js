import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import bcrypt from 'bcryptjs';
import { getPrisma } from '../src/prisma/client.js';
import { registerUser, authenticateUser } from '../src/services/authService.js';
import { hashPassword, verifyPassword } from '../src/utils/password.js';
import { AuthDTO, LoginDTO } from '../src/DTO/AuthDTO.js';
import { register, login } from '../src/controllers/authController.js';

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

test('DTOs bloqueiam senhas que ultrapassam o limite do bcrypt em UTF-8', async () => {
  const boundary = 'á'.repeat(36);
  const dto = new LoginDTO({ email: publicUser.email, password: boundary });
  const boundaryHash = await hashPassword(dto.password);
  assert.equal(await verifyPassword(dto.password, boundaryHash), true);

  for (const DTO of [LoginDTO, AuthDTO]) {
    assert.throws(() => new DTO({ ...publicUser, password: boundary + 'a' }), { status: 400 });
  }
});

test('login e cadastro validam a senha sem normalizar seu conteúdo', () => {
  for (const DTO of [LoginDTO, AuthDTO]) {
    for (const input of [undefined, null, 12345678, [], {}, '1234567', 'á'.repeat(37)]) {
      assert.throws(() => new DTO({ ...publicUser, password: input }), { status: 400 });
    }

    for (const input of ['12345678', '  senha com espaços  ', 'á'.repeat(36)]) {
      assert.equal(new DTO({ ...publicUser, password: input }).password, input);
    }
  }
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

  const user = await registerUser(new AuthDTO({
    name: '  Pessoa Teste  ', email: '  TESTE@example.com  ', password,
  }));
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
    { name: publicUser.name, email: publicUser.email, password: 'á'.repeat(37) },
  ]) {
    await assert.rejects(register({ body: input }, {}), { status: 400 });
  }
  assert.equal(create.mock.callCount(), 0);
});

test('cadastro trata conflito de email no banco', async (t) => {
  mockPrisma(t, 'create', async () => {
    throw Object.assign(new Error('unique constraint'), { code: 'P2002' });
  });
  await assert.rejects(registerUser(new AuthDTO({ ...publicUser, password })), { status: 409 });
});

test('autenticação confere o hash e retorna o usuário sem a senha', async (t) => {
  mockPrisma(t, 'findUnique', async ({ where }) => {
    assert.equal(where.email, publicUser.email);
    return { ...publicUser, passwordHash };
  });
  assert.deepEqual(await authenticateUser(new LoginDTO({ email: 'TESTE@example.com', password })), publicUser);
});

test('autenticação rejeita uma senha incorreta', async (t) => {
  mockPrisma(t, 'findUnique', async () => ({ ...publicUser, passwordHash }));
  await assert.rejects(authenticateUser(new LoginDTO({ email: publicUser.email, password: 'senha incorreta' })), {
    status: 401, message: 'Email ou senha inválidos.',
  });
});

test('autenticação usa a mesma resposta para um email inexistente', async (t) => {
  mockPrisma(t, 'findUnique', async () => null);
  await assert.rejects(authenticateUser(new LoginDTO({ email: publicUser.email, password })), {
    status: 401, message: 'Email ou senha inválidos.',
  });
});

test('login rejeita dados inválidos antes de consultar o banco', async (t) => {
  const findUnique = mockPrisma(t, 'findUnique', async () => {});
  for (const input of [
    undefined,
    null,
    [],
    'invalido',
    {},
    { email: 'invalido', password },
    { email: `${'a'.repeat(243)}@example.com`, password },
    { email: publicUser.email, password: 12345678 },
    { email: publicUser.email, password: 'curta' },
    { email: publicUser.email, password: 'á'.repeat(37) },
  ]) {
    await assert.rejects(login({ body: input }, {}), { status: 400 });
  }
  assert.equal(findUnique.mock.callCount(), 0);
});

test('DTOs normalizam campos e descartam propriedades extras', () => {
  const input = {
    name: '  Pessoa Teste  ', email: '  TESTE@example.com  ', password,
    id: 'ignorar', passwordHash: 'ignorar', role: 'admin',
  };
  assert.deepEqual({ ...new AuthDTO(input) }, {
    name: publicUser.name, email: publicUser.email, password,
  });
  assert.deepEqual({ ...new LoginDTO(input) }, { email: publicUser.email, password });
  assert.equal(input.email, '  TESTE@example.com  ');
});
