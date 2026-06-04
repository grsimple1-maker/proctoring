import { prisma } from '../config/database.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';

export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email занят' });

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { fullName, email, passwordHash, role: 'STUDENT' }
    });
    
    res.status(201).json({ message: 'Успешная регистрация' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const token = signToken({ userId: user.id, role: user.role });
    res.json({ token, user: { id: user.id, fullName: user.fullName, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getMe = async (req, res) => {
  res.json({ user: { id: req.user.id, fullName: req.user.fullName, role: req.user.role } });
};
