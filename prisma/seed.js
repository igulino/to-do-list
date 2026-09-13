import { getPrisma } from '../src/prisma/client.js';

const prisma = getPrisma();
const userId = '28d7528e-c2e7-45f4-93c3-425eb07ab400';
const titles = [
  'Planejar as atividades da semana',
  'Revisar as tarefas pendentes',
  'Organizar a mesa de trabalho',
  'Atualizar a lista de compras',
  'Ler um capítulo do livro',
  'Fazer uma caminhada',
  'Separar os documentos importantes',
  'Agendar a revisão do carro',
  'Organizar os arquivos do computador',
  'Fazer backup dos projetos',
  'Revisar o planejamento do projeto',
  'Atualizar a documentação da API',
  'Testar o cadastro de usuário',
  'Conferir a validação de email único',
  'Testar o login com cookie',
  'Conferir a expiração do token',
  'Revisar a listagem de tarefas',
  'Testar a segunda página de tarefas',
  'Conferir a última página da listagem',
  'Validar a resposta para uma página vazia',
  'Desenhar o formulário de nova tarefa',
  'Revisar os textos dos botões',
  'Adicionar mensagens de carregamento',
  'Conferir a navegação pelo teclado',
  'Testar o layout no celular',
  'Revisar o contraste das cores',
  'Organizar os componentes da interface',
  'Revisar o tratamento de erros',
  'Conferir as mensagens de validação',
  'Atualizar os exemplos de requisições',
  'Preparar os dados de demonstração',
  'Revisar os testes automatizados',
  'Conferir o isolamento entre usuários',
  'Testar a alteração de status da tarefa',
  'Revisar a edição de título e descrição',
  'Planejar a confirmação de exclusão',
  'Atualizar o roteiro de demonstração',
  'Registrar as melhorias futuras',
  'Revisar as entregas da semana',
  'Preparar o planejamento da próxima semana',
];

async function seedTasks() {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new Error(`Usuário ${userId} não encontrado. Crie o usuário antes de executar a seed.`);
  }

  const now = Date.now();
  const data = titles.map((title, index) => ({
    // IDs fixos evitam duplicações ao executar esta seed novamente.
    id: `7b497226-57f3-4bee-a39b-${String(index + 1).padStart(12, '0')}`,
    title,
    description: `Tarefa de exemplo ${index + 1} de ${titles.length} para testar a paginação.`,
    status: index % 4 === 0 ? 'COMPLETED' : 'PENDING',
    userId,
    createdAt: new Date(now - index * 60_000),
  }));

  const { count } = await prisma.task.createMany({ data, skipDuplicates: true });
  console.log(`Seed concluída para o usuário ${userId}: ${count} tarefas criadas; ${data.length - count} já existentes.`);
}

seedTasks()
  .catch(error => {
    console.error('Falha ao executar a seed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
