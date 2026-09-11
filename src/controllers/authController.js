import jwt from 'jsonwebtoken';
import { registerUser, authenticateUser } from '../services/authService.js';

export async function register(req, res) {
  const user = await registerUser(req.body);
  return res.status(201).json({ user });
}

export async function login(req, res) {
  const user = await authenticateUser(req.body);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET não configurado.');
  }

  const token = jwt.sign({ sub: user.id }, secret, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });

  return res.status(200).json({ user, token });
}
