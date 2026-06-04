import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { ProctoringEngine } from '../proctoring/proctoringEngine';
import { useTimer } from '../hooks/useTimer';
import Button from '../components/Button';

export default function Exam() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [warnings, setWarnings] = useState(0);
  const videoRef = useRef(null);
  const engineRef = useRef(null);
  const finishedRef = useRef(false);

  const { formatted } = useTimer(test ? test.duration * 60 : 0, () => finish());

  // Загрузка теста и старт экзамена
  useEffect(() => {
    (async () => {
      try {
        const testRes = await api.get(`/tests/${testId}`);
        setTest(testRes.data);
        const startRes = await api.post('/results/start', { testId });
        setResult(startRes.data);
        if (startRes.data.answers) {
          setAnswers(startRes.data.answers);
        }
      } catch (err) {
        toast.error('Не удалось загрузить тест или запустить сессию');
        navigate('/student');
      }
    })();
  }, [testId, navigate]);

  // Запуск прокторинга когда видео готово
  useEffect(() => {
    if (!result || !videoRef.current) return;

    const engine = new ProctoringEngine({
      videoElement: videoRef.current,
      onViolation: async (v) => {
        toast.error(`Нарушение: ${v.reason}`);
        try {
          const res = await api.post(`/results/${result.id}/warning`, { reason: v.reason });
          setWarnings(res.data.warnings);
          if (res.data.status === 'VIOLATION') {
            finishedRef.current = true;
            toast.error('Экзамен завершён по причине нарушения правил', { duration: 5000 });
            setTimeout(() => navigate('/student'), 3000);
          }
        } catch (e) { console.error(e); }
      }
    });
    engineRef.current = engine;
    engine.start();
    return () => engine.stop();
  }, [result, navigate]);

  const selectAnswer = (qId, idx) => {
    const next = { ...answers, [qId]: idx };
    setAnswers(next);
    api.post(`/results/${result.id}/answer`, { answers: next }).catch(() => {});
  };

  const finish = async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    engineRef.current?.stop();
    try {
      await api.post(`/results/${result.id}/finish`, { answers });
      toast.success('Экзамен завершён успешно');
    } catch (err) {
      toast.error('Ошибка при завершении экзамена');
    }
    navigate('/student');
  };

  if (!test || !result) return <div className="text-center mt-10 text-slate-400">Подготовка экзамена...</div>;

  const q = test.questions[currentQ];

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Левая часть: вопрос */}
      <div className="lg:col-span-2 card-dark">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">{test.title}</h2>
          <div className="text-2xl font-mono text-emerald-400">⏱ {formatted}</div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {test.questions.map((qq, i) => (
            <button key={qq.id} onClick={() => setCurrentQ(i)}
              className={`w-9 h-9 rounded-lg text-sm transition-all duration-200 ${i===currentQ?'bg-emerald-500 text-white':answers[qq.id]!==undefined?'bg-cyan-500/30':'bg-ink-700'}`}>
              {i+1}
            </button>
          ))}
        </div>
        {q && (
          <>
            <p className="text-lg mb-4">{q.text}</p>
            <div className="space-y-2">
              {q.options && Array.isArray(q.options) && q.options.map((opt, idx) => (
                <button key={idx} onClick={() => selectAnswer(q.id, idx)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${answers[q.id]===idx?'border-emerald-500 bg-emerald-500/10':'border-ink-600 hover:border-ink-500'}`}>
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}
        <div className="flex justify-between mt-6">
          <Button variant="ghost" onClick={()=>setCurrentQ(Math.max(0,currentQ-1))}>Назад</Button>
          {currentQ < test.questions.length-1
            ? <Button onClick={()=>setCurrentQ(currentQ+1)}>Далее</Button>
            : <Button variant="danger" onClick={finish}>Завершить экзамен</Button>}
        </div>
      </div>

      {/* Правая часть: прокторинг */}
      <div className="card-dark space-y-4">
        <h3 className="font-semibold text-cyan-400">🎥 Прокторинг (TF.js + MediaPipe)</h3>
        <video ref={videoRef} className="w-full rounded-lg bg-black aspect-video object-cover" muted playsInline />
        <div>
          <div className="text-sm text-slate-400 mb-1">Предупреждения: {warnings}/3</div>
          <div className="flex gap-2">
            {[1,2,3].map(i => (
              <div key={i} className={`flex-1 h-2 rounded transition-colors duration-300 ${warnings>=i?'bg-red-500':'bg-ink-700'}`}/>
            ))}
          </div>
        </div>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>✓ Контроль лица в кадре</li>
          <li>✓ Обнаружение посторонних</li>
          <li>✓ Переключение вкладок</li>
          <li>✓ Отключение камеры</li>
        </ul>
      </div>
    </div>
  );
}
