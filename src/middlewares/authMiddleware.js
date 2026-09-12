import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  const authorization = req.get('authorization');
  const cookieToken = req.get('cookie')?.match(/(?:^|;\s*)token=([^;]+)/)?.[1];
  const token = authorization?.match(/^Bearer[ \t]+(\S+)$/i)?.[1] || cookieToken;
  if (!token) {
    return res.status(401).json({ message: 'Token ausente ou inválido.' });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next(new Error('JWT_SECRET não configurado.'));
  }

  try {
    req.user = jwt.verify(token, secret, { algorithms: ['HS256'] });
  } catch {
    return res.status(401).json({ message: 'Token ausente ou inválido.' });
  }

  return next();
}
