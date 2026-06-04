import { prisma } from '../config/database.js';
import Joi from 'joi';

const questionSchema = Joi.object({
  text: Joi.string().min(1).required(),
  options: Joi.array().items(Joi.string()).min(2).max(6).required(),
  correctIndex: Joi.number().integer().min(0).required()
});

const testSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  subject: Joi.string().min(1).max(200).required(),
  startDate: Joi.string().required(),
  startTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  endTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  duration: Joi.number().integer().min(1).max(480).required(),
  questions: Joi.array().items(questionSchema).min(1).required()
});

export const getTests = async (req, res) => {
  try {
    const isTeacher = req.user.role === 'TEACHER';
    const tests = await prisma.test.findMany({
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            options: true,
            // Hide correctIndex from students
            ...(isTeacher && { correctIndex: true })
          }
        },
        createdBy: { select: { fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTestById = async (req, res) => {
  try {
    const isTeacher = req.user.role === 'TEACHER';
    const test = await prisma.test.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            options: true,
            ...(isTeacher && { correctIndex: true })
          }
        }
      }
    });
    if (!test) return res.status(404).json({ error: 'Тест не найден' });
    res.json(test);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createTest = async (req, res) => {
  try {
    const { error, value } = testSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { title, subject, startDate, startTime, endTime, duration, questions } = value;

    const newTest = await prisma.test.create({
      data: {
        title, subject, startDate, startTime, endTime,
        duration: parseInt(duration),
        createdById: req.user.id,
        questions: {
          create: questions.map(q => ({
            text: q.text,
            options: q.options,
            correctIndex: parseInt(q.correctIndex)
          }))
        }
      },
      include: { questions: true }
    });

    res.status(201).json(newTest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTest = async (req, res) => {
  try {
    const testId = parseInt(req.params.id);

    // Verify ownership
    const existing = await prisma.test.findUnique({ where: { id: testId } });
    if (!existing) return res.status(404).json({ error: 'Тест не найден' });
    if (existing.createdById !== req.user.id) {
      return res.status(403).json({ error: 'Нет прав редактировать этот тест' });
    }

    const { error, value } = testSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { title, subject, startDate, startTime, endTime, duration, questions } = value;

    await prisma.question.deleteMany({ where: { testId } });

    const updatedTest = await prisma.test.update({
      where: { id: testId },
      data: {
        title, subject, startDate, startTime, endTime,
        duration: parseInt(duration),
        questions: {
          create: questions.map(q => ({
            text: q.text,
            options: q.options,
            correctIndex: parseInt(q.correctIndex)
          }))
        }
      },
      include: { questions: true }
    });

    res.json(updatedTest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTest = async (req, res) => {
  try {
    const testId = parseInt(req.params.id);

    // Verify ownership
    const existing = await prisma.test.findUnique({ where: { id: testId } });
    if (!existing) return res.status(404).json({ error: 'Тест не найден' });
    if (existing.createdById !== req.user.id) {
      return res.status(403).json({ error: 'Нет прав удалять этот тест' });
    }

    await prisma.test.delete({ where: { id: testId } });
    res.json({ message: 'Тест успешно удален' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
