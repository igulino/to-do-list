import app from './app.js';

const port = Number(process.env.PORT || 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT deve ser um número inteiro entre 1 e 65535.');
}

const server = app.listen(port);

server.once('listening', () => {
  console.log(`API disponível em http://localhost:${port}`);
});

server.on('error', (error) => {
  console.error(`Não foi possível iniciar a API: ${error.code}`);
  process.exitCode = 1;
});

function shutdown() {
  server.close(() => {
    console.log('Servidor encerrado.');
  });
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
