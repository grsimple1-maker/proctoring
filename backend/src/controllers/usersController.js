import { prisma } from '../config/database.js';
import { hashPassword } from '../utils/password.js';

export const createTeacher = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email занят' });

    const passwordHash = await hashPassword(password);
    const newTeacher = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        role: 'TEACHER'
      }
    });

    res.status(201).json({
      message: 'Успешно создан аккаунт преподавателя',
      user: {
        id: newTeacher.id,
        fullName: newTeacher.fullName,
        email: newTeacher.email,
        role: newTeacher.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
