-- Um mesmo título pode ser usado por usuários diferentes.
CREATE UNIQUE INDEX "Task_userId_title_key" ON "Task"("userId", "title");
