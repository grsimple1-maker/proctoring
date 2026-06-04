# 🛡️ ExamGuard Proctor

Полноценная fullstack-система онлайн-экзаменов с AI-прокторингом на базе TensorFlow.js.

## ✨ Возможности
- 🎓 Регистрация и аутентификация (JWT, bcrypt) с ролями TEACHER / STUDENT
- 📝 CRUD тестов, вопросов, вариантов ответов (преподаватель)
- ⏰ Автоматическое открытие/закрытие тестов по расписанию
- 🤖 РЕАЛЬНЫЙ AI-прокторинг (MediaPipe Face Detection через TF.js)
- 🚨 Детекция нарушений: отсутствие лица, посторонние, переключение вкладок, отключение камеры
- ⚠️ Политика 3-х предупреждений с автозавершением
- 📊 Экспорт результатов в настоящие PDF (jsPDF) и Excel (.xlsx через SheetJS)
- 🎨 Адаптивный тёмный дизайн (Tailwind CSS)

## 🛠️ Стек технологий
| Слой | Технологии |
|------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router 6 |
| Backend | Node.js 20, Express 4, Prisma ORM |
| База данных | PostgreSQL 16 |
| Прокторинг | TensorFlow.js + MediaPipe Face Detection, WebRTC |
| Аутентификация | JWT (HS256, 8h), bcrypt (10 rounds) |
| Экспорт | jsPDF + autotable, SheetJS (xlsx) |
| Инфраструктура | Docker, Docker Compose, Nginx |

## 🚀 Быстрый старт через Docker

```bash
docker-compose up -d --build
```

Откройте http://localhost:5173

## 🔑 Демо-аккаунты
- **Преподаватель:** `teacher@test.ru` / `123`
- **Студент:** `student@test.ru` / `123`

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` — регистрация студента
- `POST /api/auth/login` — вход
- `GET /api/auth/me` — текущий пользователь (JWT)

### Tests (TEACHER для CRUD, STUDENT для чтения)
- `GET /api/tests` — список тестов
- `GET /api/tests/:id` — детали теста с вопросами
- `POST /api/tests` — создать тест с вопросами
- `PUT /api/tests/:id` — обновить тест
- `DELETE /api/tests/:id` — удалить тест

### Results
- `POST /api/results/start` — начать экзамен `{ testId }`
- `POST /api/results/:id/answer` — сохранить промежуточные ответы
- `POST /api/results/:id/warning` — зафиксировать нарушение `{ reason }`
- `POST /api/results/:id/finish` — завершить экзамен `{ answers }`
- `GET /api/results` — TEACHER видит всё, STUDENT только свои

### Users
- `POST /api/users/teacher` — создание преподавателя (только TEACHER)

## 🧪 Локальный запуск без Docker

```bash
# 1. PostgreSQL должен быть запущен локально
# 2. Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run seed
npm run dev

# 3. Frontend (новый терминал)
cd frontend
npm install
npm run dev
```
