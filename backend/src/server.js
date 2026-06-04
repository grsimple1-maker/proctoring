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

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP in dev to make debugging/WebRTC/TensorFlow model loading easier if needed
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/users', usersRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
