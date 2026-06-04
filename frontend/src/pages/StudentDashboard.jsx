import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Button from '../components/Button';
import StatusPill from '../components/StatusPill';

// Проверка временного окна доступа
function testWindow(test) {
  const now = new Date();
  const start = new Date(`${test.startDate}T${test.startTime}`);
  const end = new Date(`${test.startDate}T${test.endTime}`);
  if (now < start) return 'scheduled';
  if (now > end) return 'closed';
  return 'open';
}

export default function StudentDashboard() {
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    api.get('/tests').then(r => setTests(r.data));
    api.get('/results').then(r => setResults(r.data));
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-emerald-400">Доступные тесты</h2>
      <div className="grid gap-3">
        {tests.map(t => {
          const w = testWindow(t);
          return (
            <div key={t.id} className="card-dark flex justify-between items-center">
              <div>
                <h4 className="font-bold text-lg text-white">{t.title}</h4>
                <p className="text-sm text-slate-400">{t.subject} • {t.startDate} {t.startTime}-{t.endTime} • {t.duration} мин</p>
              </div>
              {w==='open'
                ? <Button onClick={()=>nav(`/exam/${t.id}`)}>Начать тестирование</Button>
                : <span className="text-slate-500 font-semibold">{w==='scheduled'?'Откроется по расписанию':'Доступ закрыт'}</span>}
            </div>
          );
        })}
        {tests.length === 0 && (
          <div className="text-center py-8 text-slate-400">В системе пока нет тестов.</div>
        )}
      </div>

      <h2 className="text-2xl font-bold text-cyan-400">История сдач</h2>
      <div className="card-dark">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="text-slate-400 text-left border-b border-ink-600">
                <th className="py-2">Тест</th>
                <th>Балл</th>
                <th>Предупр.</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r.id} className="border-b border-ink-700 hover:bg-ink-700/50">
                  <td className="py-3 font-semibold">{r.test?.title}</td>
                  <td>{r.score}%</td>
                  <td>{r.warnings}</td>
                  <td><StatusPill status={r.status} /></td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-slate-400">Вы пока не сдавали экзаменов.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
