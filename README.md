# TDL Backend

API de tarefas com Node.js, Express, PostgreSQL e Prisma. Oferece cadastro, login com cookie HTTP-only e CRUD de tarefas por usuário. Este repositório contém apenas o backend; não é necessário iniciar um frontend para testar a API.

## Pré-requisitos

- Git.
- **Node.js 24.x** e npm (versão usada na validação: Node.js 24.21.0 / npm 11.19.0). A versão exata do Node está em `.nvmrc`; `.npmrc` rejeita versões incompatíveis.
- **PostgreSQL instalado e em execução**, com acesso a uma conta administrativa para criar o usuário e o banco. A validação foi feita com PostgreSQL 18.6.
- `psql` no `PATH`. No Windows, se necessário, adicione a pasta dos binários na sessão do PowerShell: `$env:Path += ';C:\Program Files\PostgreSQL\18\bin'` (ajuste para sua instalação).
- Acesso à internet para baixar os pacotes npm e os componentes do Prisma na primeira instalação.

Confira as ferramentas:

```sh
node --version
npm --version
psql --version
```

## Executar após clonar

Execute os comandos na raiz do repositório. Os blocos `sh` abaixo também funcionam no PowerShell, exceto onde há uma alternativa explícita.

### 1. Clonar e instalar as dependências

```sh
git clone https://github.com/igulino/to-do-list.git tdl-back
cd tdl-back
npm ci
```

`npm ci` instala as versões do `package-lock.json` e executa automaticamente `prisma generate`. Esse passo não precisa de `.env` nem de conexão com o banco. Inclua as dependências de desenvolvimento: a CLI do Prisma é necessária para configurar o banco. Não use `--ignore-scripts` ou `--omit=dev` neste procedimento.

### 2. Configurar o ambiente

Linux/macOS:

```sh
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

Gere um segredo e cole o resultado em `JWT_SECRET` no `.env`:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Para o banco local criado no próximo passo, mantenha estes valores no `.env`:

```dotenv
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
DB_URL=localhost
DB_PORT=5432
DB_USER=tdl_app
DB_PASSWORD=tdl_local_password
DB_NAME=tdl
DB_SCHEMA=public
JWT_SECRET=COLE_AQUI_O_SEGREDO_GERADO
JWT_EXPIRES_IN=1h
```

`tdl_local_password` é uma senha de exemplo para desenvolvimento local. Se escolher outra, use o mesmo valor no `.env` e no SQL abaixo. Não versione o `.env` nem reutilize estas credenciais em produção. Se o PostgreSQL estiver em outra porta, ajuste `DB_PORT` e o argumento `-p` dos comandos `psql`.

### 3. Criar o usuário e o banco PostgreSQL

Com o serviço PostgreSQL iniciado, conecte-se como administrador (informe a senha definida na instalação):

```sh
psql -h localhost -p 5432 -U postgres -d postgres
```

No prompt do `psql`, execute uma vez:

```sql
CREATE ROLE tdl_app WITH LOGIN PASSWORD 'tdl_local_password';
CREATE DATABASE tdl OWNER tdl_app;
\q
```

O usuário da aplicação será o proprietário do banco e poderá criar as tabelas e índices das migrations. Se já houver um banco dedicado a este projeto, configure suas credenciais no `.env` e pule a criação; não apague bancos existentes.

Confirme a conexão como usuário da aplicação (senha: a escolhida para `tdl_app`):

```sh
psql -h localhost -p 5432 -U tdl_app -d tdl -c "SELECT current_database(), current_user;"
```

### 4. Aplicar e conferir as migrations

```sh
npm run prisma:validate
npm run prisma:deploy
npx prisma migrate status
npm test
```

O primeiro comando valida o schema. O segundo aplica as três migrations versionadas, criando `User`, `Task`, suas restrições e o histórico `_prisma_migrations`. A consulta de status deve informar `Database schema is up to date!`; `npm test` deve encerrar sem falhas. Executar `npm run prisma:deploy` novamente deve informar que não há migrations pendentes.

Não é necessário executar seed para iniciar a aplicação. O primeiro usuário é criado pela rota de cadastro, conforme o teste abaixo.

### 5. Iniciar o backend

```sh
npm start
```

Resultado esperado: `API disponível em http://localhost:3000`. Mantenha esse terminal aberto e use outro terminal para testar. Encerre com `Ctrl+C`.

Para desenvolver com reinicialização automática ao salvar arquivos, use em seu lugar:

```sh
npm run dev
```
