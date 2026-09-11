import { HttpError } from '../utils/httpError.js';

export function errorMiddleware(error, _req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON inválido.' });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Corpo da requisição muito grande.' });
  }

  if (error instanceof HttpError) {
    return res.status(error.status).json({ message: error.message });
  }

  return res.status(500).json({ message: 'Erro interno do servidor.' });
}
