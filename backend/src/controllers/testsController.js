import { prisma } from '../config/database.js';

export const getTests = async (req, res) => {
  try {
    const tests = await prisma.test.findMany({
      include: {
        questions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTestById = async (req, res) => {
  try {
    const test = await prisma.test.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { questions: true }
    });
    if (!test) return res.status(404).json({ error: 'Тест не найден' });
    res.json(test);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createTest = async (req, res) => {
  try {
    const { title, subject, startDate, startTime, endTime, duration, questions } = req.body;
    
    const newTest = await prisma.test.create({
      data: {
        title,
        subject,
        startDate,
        startTime,
        endTime,
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
    const { title, subject, startDate, startTime, endTime, duration, questions } = req.body;
    const testId = parseInt(req.params.id);

    // Delete existing questions
    await prisma.question.deleteMany({ where: { testId } });

    // Update test details and create new questions
    const updatedTest = await prisma.test.update({
      where: { id: testId },
      data: {
        title,
        subject,
        startDate,
        startTime,
        endTime,
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
    await prisma.test.delete({ where: { id: testId } });
    res.json({ message: 'Тест успешно удален' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
