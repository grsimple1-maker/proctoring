import { prisma } from '../config/database.js';

/**
 * Checks if the current time is within the test's allowed window.
 * Returns { allowed: bool, reason: string }
 */
function checkTestWindow(test) {
  const now = new Date();
  const nowDate = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
  const nowTime = now.toTimeString().slice(0, 5);   // "HH:MM"

  if (test.startDate !== nowDate) {
    return { allowed: false, reason: `Тест доступен только ${test.startDate}` };
  }
  if (nowTime < test.startTime) {
    return { allowed: false, reason: `Тест начнётся в ${test.startTime}` };
  }
  if (nowTime >= test.endTime) {
    return { allowed: false, reason: `Тест завершился в ${test.endTime}` };
  }
  return { allowed: true };
}

export const startExam = async (req, res) => {
  try {
    const { testId } = req.body;
    if (!testId) return res.status(400).json({ error: 'testId обязателен' });

    const test = await prisma.test.findUnique({
      where: { id: parseInt(testId) },
      include: { questions: true }
    });

    if (!test) return res.status(404).json({ error: 'Тест не найден' });

    // Check time window (ТЗ п.4)
    const windowCheck = checkTestWindow(test);
    if (!windowCheck.allowed) {
      return res.status(403).json({ error: windowCheck.reason });
    }

    // Prevent re-starting a completed/violated exam (ТЗ п.5)
    const existingResult = await prisma.examResult.findFirst({
      where: {
        testId: test.id,
        studentId: req.user.id,
        status: { in: ['COMPLETED', 'VIOLATION'] }
      }
    });
    if (existingResult) {
      return res.status(409).json({ error: 'Вы уже прошли этот тест' });
    }

    // Resume in-progress session if any
    const inProgress = await prisma.examResult.findFirst({
      where: { testId: test.id, studentId: req.user.id, status: 'IN_PROGRESS' }
    });
    if (inProgress) return res.json(inProgress);

    const result = await prisma.examResult.create({
      data: {
        testId: test.id,
        studentId: req.user.id,
        totalQuestions: test.questions.length,
        events: [{ type: 'start', timestamp: new Date().toISOString() }]
      }
    });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const addWarning = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'reason обязателен' });

    const result = await prisma.examResult.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!result) return res.status(404).json({ error: 'Результат экзамена не найден' });
    if (result.studentId !== req.user.id) {
      return res.status(403).json({ error: 'Нет доступа' });
    }
    if (result.status !== 'IN_PROGRESS') {
      return res.status(409).json({ error: 'Экзамен уже завершён' });
    }

    const events = [...result.events, { type: 'warning', reason, timestamp: new Date().toISOString() }];
    const warnings = result.warnings + 1;
    const isViolation = warnings >= 3;

    const updated = await prisma.examResult.update({
      where: { id: result.id },
      data: {
        warnings,
        events,
        status: isViolation ? 'VIOLATION' : 'IN_PROGRESS',
        // FIX: only set finishedAt when actually finishing (не перезаписывать null)
        ...(isViolation && { finishedAt: new Date() })
      }
    });

    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const saveAnswer = async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'answers обязателен' });
    }

    const resultId = parseInt(req.params.id);
    const result = await prisma.examResult.findUnique({ where: { id: resultId } });

    if (!result) return res.status(404).json({ error: 'Результат не найден' });
    if (result.studentId !== req.user.id) return res.status(403).json({ error: 'Нет доступа' });
    if (result.status !== 'IN_PROGRESS') return res.json(result); // silently ignore if done

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
    const { answers } = req.body;
    const resultId = parseInt(req.params.id);

    const result = await prisma.examResult.findUnique({
      where: { id: resultId },
      include: { test: { include: { questions: true } } }
    });

    if (!result) return res.status(404).json({ error: 'Результат экзамена не найден' });
    if (result.studentId !== req.user.id) return res.status(403).json({ error: 'Нет доступа' });

    // If already finished (VIOLATION), just return current state
    if (result.status !== 'IN_PROGRESS') return res.json(result);

    const finalAnswers = answers || result.answers || {};
    let correctAnswers = 0;
    result.test.questions.forEach(q => {
      if (finalAnswers[q.id] === q.correctIndex) correctAnswers++;
    });
    const score = result.totalQuestions > 0
      ? Math.round((correctAnswers / result.totalQuestions) * 100)
      : 0;

    const updated = await prisma.examResult.update({
      where: { id: resultId },
      data: {
        answers: finalAnswers,
        correctAnswers,
        score,
        status: 'COMPLETED',
        finishedAt: new Date(),
        events: [...result.events, { type: 'finish', timestamp: new Date().toISOString() }]
      }
    });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getAllResults = async (req, res) => {
  try {
    const where = req.user.role === 'TEACHER'
      ? {}
      : { studentId: req.user.id };

    const results = await prisma.examResult.findMany({
      where,
      include: {
        student: { select: { fullName: true, email: true } },
        test: { select: { title: true, subject: true } }
      },
      orderBy: { startedAt: 'desc' }
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
