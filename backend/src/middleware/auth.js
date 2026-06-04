import { verifyToken } from '../utils/jwt.js';
import { prisma } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Нет доступа' });

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId }});
    
    if (!user) return res.status(401).json({ error: 'Пользователь не найден' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Неверный токен' });
  }
};
