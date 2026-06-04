import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import Button from '../components/Button';
import Field from '../components/Field';
import StatCard from '../components/StatCard';
import StatusPill from '../components/StatusPill';
import { exportResultsToPdf } from '../utils/exportPdf';
import { exportResultsToExcel } from '../utils/exportExcel';

export default function TeacherDashboard() {
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [tab, setTab] = useState('overview');
  const [form, setForm] = useState({ title: '', subject: '', startDate: '', startTime: '10:00', endTime: '11:00', duration: 60, questions: [] });
  const [teacherForm, setTeacherForm] = useState({ fullName: '', email: '', password: '', confirm: '' });

  const load = async () => {
    try {
      const [t, r] = await Promise.all([api.get('/tests'), api.get('/results')]);
      setTests(t.data); 
      setResults(r.data);
    } catch (e) {
      toast.error('Ошибка загрузки данных');
    }
  };

  useEffect(() => { load(); }, []);

  const saveTest = async () => {
    try {
      if (form.id) {
        await api.put(`/tests/${form.id}`, form);
        toast.success('Тест обновлен');
      } else {
        await api.post('/tests', form);
        toast.success('Тест сохранён');
      }
      load();
      setForm({ title: '', subject: '', startDate: '', startTime: '10:00', endTime: '11:00', duration: 60, questions: [] });
      setTab('overview');
    } catch (e) { 
      toast.error('Ошибка сохранения'); 
    }
  };

  const deleteTest = async (id) => {
    if (!confirm('Удалить тест?')) return;
    try {
      await api.delete(`/tests/${id}`); 
      toast.success('Удалено'); 
      load();
    } catch (e) {
      toast.error('Ошибка удаления');
    }
  };

  const addQuestion = () => setForm({ ...form, questions: [...form.questions, { text: '', options: ['','','',''], correctIndex: 0 }] });

  const saveTeacher = async (e) => {
    e.preventDefault();
    if (teacherForm.password !== teacherForm.confirm) {
      return toast.error('Пароли не совпадают');
    }
    try {
      await api.post('/users/teacher', {
        fullName: teacherForm.fullName,
        email: teacherForm.email,
        password: teacherForm.password
      });
      toast.success('Преподаватель успешно создан');
      setTeacherForm({ fullName: '', email: '', password: '', confirm: '' });
      setTab('overview');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Ошибка создания преподавателя');
    }
  };

  const avgScore = results.length ? Math.round(results.reduce((s,r)=>s+r.score,0)/results.length) : 0;
  const violations = results.filter(r=>r.status==='VIOLATION').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Тестов" value={tests.length} />
        <StatCard label="Сдач" value={results.length} accent="cyan" />
        <StatCard label="Средний балл" value={`${avgScore}%`} />
        <StatCard label="Нарушений" value={violations} accent="red" />
      </div>

      <div className="flex gap-2 border-b border-ink-600">
        {['overview','create','results','teachers'].map(t => (
          <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 font-semibold transition ${tab===t?'border-b-2 border-emerald-500 text-emerald-400':'text-slate-400 hover:text-slate-200'}`}>
            {t==='overview'?'Тесты':t==='create'?'Создать тест':t==='results'?'Результаты':'Добавить преподавателя'}
          </button>
        ))}
      </div>

      {tab==='overview' && (
        <div className="grid gap-3">
          {tests.map(t => (
            <div key={t.id} className="card-dark flex justify-between items-center">
              <div>
                <h4 className="font-bold text-lg text-white">{t.title}</h4>
                <p className="text-sm text-slate-400">{t.subject} • {t.startDate} {t.startTime}-{t.endTime} • {t.duration} мин</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={()=>{setForm(t);setTab('create');}}>Редактировать</Button>
                <Button variant="danger" onClick={()=>deleteTest(t.id)}>Удалить</Button>
              </div>
            </div>
          ))}
          {tests.length === 0 && (
            <div className="text-center py-10 text-slate-400">Нет созданных тестов. Вы можете создать первый тест.</div>
          )}
        </div>
      )}

      {tab==='create' && (
        <div className="card-dark space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Название" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
            <Field label="Предмет" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} />
            <Field label="Дата" type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})} />
            <Field label="Длительность (мин)" type="number" value={form.duration} onChange={e=>setForm({...form,duration:+e.target.value})} />
            <Field label="Время начала" type="time" value={form.startTime} onChange={e=>setForm({...form,startTime:e.target.value})} />
            <Field label="Время окончания" type="time" value={form.endTime} onChange={e=>setForm({...form,endTime:e.target.value})} />
          </div>
          <div className="space-y-3">
            {form.questions.map((q,qi) => (
              <div key={qi} className="bg-ink-900 p-3 rounded-lg space-y-2 border border-ink-700">
                <Field label={`Вопрос ${qi+1}`} value={q.text} onChange={e=>{const qs=[...form.questions];qs[qi].text=e.target.value;setForm({...form,questions:qs});}} />
                {q.options.map((opt,oi) => (
                  <div key={oi} className="flex gap-2 items-center">
                    <input type="radio" checked={q.correctIndex===oi} name={`correctIndex-${qi}`} onChange={()=>{const qs=[...form.questions];qs[qi].correctIndex=oi;setForm({...form,questions:qs});}} />
                    <input value={opt} placeholder={`Вариант ${oi+1}`} onChange={e=>{const qs=[...form.questions];qs[qi].options[oi]=e.target.value;setForm({...form,questions:qs});}}
                      className="flex-1 bg-ink-800 border border-ink-600 rounded px-2 py-1 outline-none text-slate-200 focus:border-emerald-500" />
                  </div>
                ))}
              </div>
            ))}
            <Button variant="ghost" onClick={addQuestion}>+ Добавить вопрос</Button>
          </div>
          <Button onClick={saveTest}>Сохранить тест</Button>
        </div>
      )}

      {tab==='results' && (
        <div className="card-dark">
          <div className="flex justify-between mb-4 items-center">
            <h3 className="text-lg font-bold">Результаты экзаменов</h3>
            <div className="flex gap-2">
              <Button variant="soft" onClick={()=>exportResultsToExcel(results)}>📊 Excel</Button>
              <Button variant="soft" onClick={()=>exportResultsToPdf(results)}>📄 PDF</Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-slate-400 text-left border-b border-ink-600">
                  <th className="py-2">Студент</th>
                  <th>Тест</th>
                  <th>Балл</th>
                  <th>Предупр.</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.id} className="border-b border-ink-700 hover:bg-ink-700/50">
                    <td className="py-3 font-semibold">{r.student?.fullName}</td>
                    <td>{r.test?.title}</td>
                    <td>{r.score}%</td>
                    <td>{r.warnings}</td>
                    <td><StatusPill status={r.status} /></td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-slate-400">Результаты сдачи экзаменов отсутствуют</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==='teachers' && (
        <div className="card-dark max-w-md mx-auto space-y-4">
          <h3 className="text-lg font-bold text-emerald-400">Создать нового преподавателя</h3>
          <form onSubmit={saveTeacher} className="space-y-4">
            <Field label="ФИО преподавателя" type="text" value={teacherForm.fullName} onChange={e=>setTeacherForm({...teacherForm, fullName: e.target.value})} required />
            <Field label="Email" type="email" value={teacherForm.email} onChange={e=>setTeacherForm({...teacherForm, email: e.target.value})} required />
            <Field label="Пароль" type="password" value={teacherForm.password} onChange={e=>setTeacherForm({...teacherForm, password: e.target.value})} required />
            <Field label="Подтвердите пароль" type="password" value={teacherForm.confirm} onChange={e=>setTeacherForm({...teacherForm, confirm: e.target.value})} required />
            <Button type="submit" className="w-full">Создать преподавателя</Button>
          </form>
        </div>
      )}
    </div>
  );
}
