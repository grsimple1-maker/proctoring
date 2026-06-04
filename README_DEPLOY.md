# 🚀 Деплой ExamGuard на Vercel

## Обзор архитектуры

```
Vercel Project 1: examguard-backend   →  https://examguard-backend.vercel.app
Vercel Project 2: examguard-frontend  →  https://examguard.vercel.app
Neon (free):      PostgreSQL database →  подключается к бекенду
```

---

## Шаг 1 — База данных на Neon (бесплатно)

1. Идите на https://neon.tech → **Sign Up** (через GitHub)
2. **New Project** → название `examguard`
3. После создания скопируйте **Connection String**:
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/examguard?sslmode=require
   ```
   ⚠️ Сохраните — она понадобится на следующем шаге.

---

## Шаг 2 — Деплой бекенда

### 2.1 Подготовьте репозиторий
Папка `backend/` должна быть отдельным GitHub-репозиторием или подпапкой монорепо.

### 2.2 Примените изменения из этого архива
```bash
# Скопируйте файлы из deploy/ в ваш проект:
cp deploy/backend/api/index.js          backend/api/index.js
cp deploy/backend/vercel.json           backend/vercel.json
cp deploy/backend/src_server_patch.js   backend/src/server.js   # ЗАМЕНА server.js
```

### 2.3 Задеплойте на Vercel
1. Идите на https://vercel.com → **Add New Project**
2. Выберите ваш репозиторий, **Root Directory** = `backend`
3. **Framework Preset** = Other
4. Добавьте переменные окружения (**Settings → Environment Variables**):

| Переменная      | Значение                                      |
|-----------------|-----------------------------------------------|
| `DATABASE_URL`  | Строка подключения из Neon (шаг 1)            |
| `JWT_SECRET`    | Любая длинная случайная строка (мин. 32 символа) |
| `FRONTEND_URL`  | https://examguard.vercel.app *(после деплоя фронта)* |
| `NODE_ENV`      | production                                    |

5. **Deploy** → дождитесь завершения
6. Получите URL: `https://examguard-backend.vercel.app`

### 2.4 Примените миграции Prisma (один раз)
```bash
cd backend
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." node prisma/seed.js
```

---

## Шаг 3 — Деплой фронтенда

### 3.1 Примените изменения из этого архива
```bash
cp deploy/frontend/src/services/api.js   frontend/src/services/api.js
cp deploy/frontend/vercel.json           frontend/vercel.json
cp deploy/frontend/vite.config.js        frontend/vite.config.js
```

### 3.2 Задеплойте на Vercel
1. **Add New Project** → тот же или другой репозиторий
2. **Root Directory** = `frontend`
3. **Framework Preset** = Vite
4. Добавьте переменные окружения:

| Переменная      | Значение                                        |
|-----------------|-------------------------------------------------|
| `VITE_API_URL`  | https://examguard-backend.vercel.app (из шага 2) |

5. **Deploy** → готово!

---

## Шаг 4 — Обновите FRONTEND_URL в бекенде

После получения URL фронтенда:
1. Vercel → бекенд-проект → **Settings → Environment Variables**
2. Обновите `FRONTEND_URL` = `https://ваш-фронтенд.vercel.app`
3. **Redeploy** (Settings → Deployments → Redeploy)

---

## ✅ Проверка

```
Фронтенд: https://examguard.vercel.app
Бекенд health: https://examguard-backend.vercel.app/api/health
  → должен вернуть {"ok":true}

Демо-аккаунты:
  Преподаватель: teacher@test.ru / 123
  Студент:       student@test.ru / 123
```

---

## ⚠️ Ограничения Vercel Free

| Ограничение          | Free Plan         |
|----------------------|-------------------|
| Serverless timeout   | 10 сек на запрос  |
| Bandwidth            | 100 GB/мес        |
| Deployments          | неограничено      |

> Нейросети TF.js (прокторинг) работают **только во фронтенде**, не затрагивают лимиты бекенда.

---

## 🔄 Альтернатива: Railway (проще для Express)

Если Vercel serverless создаёт проблемы с Prisma, можно использовать Railway:
```
https://railway.app → New Project → Deploy from GitHub → выбрать папку backend
```
Railway запускает обычный Docker-контейнер — никаких изменений в коде не нужно.
