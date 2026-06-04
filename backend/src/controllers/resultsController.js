import { prisma } from '../config/database.js';

export const startExam = async (req, res) => {
  try {
    const { testId } = req.body;
    const test = await prisma.test.findUnique({ where: { id: parseInt(testId) }, include: { questions: true } });
    
    if (!test) return res.status(404).json({ error: 'Тест не найден' });

    const result = await prisma.examResult.create({
      data: {
        testId: test.id,
        studentId: req.user.id,
        totalQuestions: test.questions.length,
        events: [{ type: 'start', timestamp: new Date().toISOString() }]
      }
    });
    res.json(result);
  } catch(err) { res.status(500).json({ error: err.message }); }
};

export const addWarning = async (req, res) => {
  try {
    const { reason } = req.body;
    const result = await prisma.examResult.findUnique({ where: { id: parseInt(req.params.id) } });
    
    if (!result) return res.status(404).json({ error: 'Результат экзамена не найден' });

    const events = [...result.events, { type: 'warning', reason, timestamp: new Date().toISOString() }];
    const warnings = result.warnings + 1;
    let status = result.status;

    if (warnings >= 3) status = 'VIOLATION';

    const updated = await prisma.examResult.update({
      where: { id: result.id },
      data: { warnings, events, status, finishedAt: status === 'VIOLATION' ? new Date() : null }
    });
    
    res.json(updated);
  } catch(err) { res.status(500).json({ error: err.message }); }
};

export const saveAnswer = async (req, res) => {
  try {
    const { answers } = req.body;
    const resultId = parseInt(req.params.id);
    const updated = await prisma.examResult.update({
      where: { id: resultId },
      data: { answers }
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const finishExam = async (req, res) => {
  try {
    const { answers } = req.body; // { questionId: selectedIndex }
    const resultId = parseInt(req.params.id);
    const result = await prisma.examResult.findUnique({ where: { id: resultId }, include: { test: { include: { questions: true } } } });

    if (!result) return res.status(404).json({ error: 'Результат экзамена не найден' });

    let correctAnswers = 0;
    result.test.questions.forEach(q => {
      if (answers[q.id] === q.correctIndex) correctAnswers++;
    });
    const score = Math.round((correctAnswers / result.totalQuestions) * 100);

    const updated = await prisma.examResult.update({
      where: { id: resultId },
      data: {
        answers, correctAnswers, score, status: 'COMPLETED', finishedAt: new Date(),
        events: [...result.events, { type: 'finish', timestamp: new Date().toISOString() }]
      }
    });
    res.json(updated);
  } catch(err) { res.status(500).json({ error: err.message }); }
};

export const getAllResults = async (req, res) => {
  try {
    const where = req.user.role === 'TEACHER' ? {} : { studentId: req.user.id };
    const results = await prisma.examResult.findMany({
      where,
      include: {
        student: {
          select: { fullName: true, email: true }
        },
        test: {
          select: { title: true, subject: true }
        }
      },
      orderBy: {
        startedAt: 'desc'
      }
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
