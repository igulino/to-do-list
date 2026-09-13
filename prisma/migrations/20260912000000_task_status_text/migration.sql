BEGIN;

-- Converte os valores existentes sem recriar a coluna ou apagar tarefas.
ALTER TABLE "Task" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "status" TYPE VARCHAR(100) USING ("status"::text);
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'PENDING';

DROP TYPE "TaskStatus";

COMMIT;
