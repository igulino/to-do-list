import jwt from 'jsonwebtoken';
import { registerUser, authenticateUser } from '../services/authService.js';
import { AuthDTO, LoginDTO } from '../DTO/AuthDTO.js';

export async function register(req, res) {
  const dto = new AuthDTO(req.body);
  const user = await registerUser(dto);
  return res.status(201).json({ user });
}
export async function login(req, res) {
  const dto = new LoginDTO(req.body);
  const user = await authenticateUser(dto);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET não configurado.');
  }

  const token = jwt.sign({ sub: user.id }, secret, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });

  const { exp } = jwt.decode(token);
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(exp * 1000),
  });

  return res.status(200).json({ user });
}
