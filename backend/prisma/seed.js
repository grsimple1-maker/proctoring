import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123', 10);

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@test.ru' },
    update: {},
    create: {
      email: 'teacher@test.ru',
      fullName: 'Иванов Иван Иванович (Преподаватель)',
      passwordHash,
      role: 'TEACHER',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@test.ru' },
    update: {},
    create: {
      email: 'student@test.ru',
      fullName: 'Смирнов Алексей (Студент)',
      passwordHash,
      role: 'STUDENT',
    },
  });

  // Создаем тест
  const test = await prisma.test.create({
    data: {
      title: 'Основы SQL',
      subject: 'Базы данных',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '00:00',
      endTime: '23:59',
      duration: 60,
      createdById: teacher.id,
      questions: {
        create: [
          {
            text: 'Что означает SQL?',
            options: ['Structured Query Language', 'Strong Question Language', 'Structured Question Language', 'Simple Query Language'],
            correctIndex: 0
          },
          {
            text: 'Какая команда используется для извлечения данных?',
            options: ['GET', 'OPEN', 'EXTRACT', 'SELECT'],
            correctIndex: 3
          }
        ]
      }
    }
  });

  console.log('Сид выполнен успешно!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
