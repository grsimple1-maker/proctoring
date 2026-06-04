// ЗАМЕНИТЕ содержимое backend/src/server.js на этот файл

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import testsRoutes from './routes/tests.js';
import resultsRoutes from './routes/results.js';
import usersRoutes from './routes/users.js';

dotenv.config();
const app = express();

// CORS: разрешаем только наш фронтенд (или все в dev)
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : true; // true = все origins в dev

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Локальный запуск (не нужен на Vercel — там экспортируется app)
if (process.env.NODE_ENV !== 'production' || process.env.START_LOCAL) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}

export default app;
