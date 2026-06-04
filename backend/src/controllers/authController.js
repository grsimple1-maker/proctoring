import { prisma } from '../config/database.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import Joi from 'joi';

const registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('TEACHER', 'STUDENT').default('STUDENT')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { fullName, email, password, role } = value;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email занят' });

    const passwordHash = await hashPassword(password);
    await prisma.user.create({
      data: { fullName, email, passwordHash, role }
    });

    res.status(201).json({ message: 'Успешная регистрация' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = value;
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
