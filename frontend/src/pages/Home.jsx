import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  const advantages = [
    ["Автоматическое расписание", "Тесты открываются и закрываются строго по заданным дате и времени."],
    ["Прокторинг в браузере", "Веб-камера, контроль вкладок, фиксация отключения камеры и потери фокуса."],
    ["Журнал нарушений", "Каждое предупреждение сохраняется в отчёте преподавателя."],
    ["Экспорт результатов", "Доступны отчёты в Excel и PDF."]
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-6">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400 font-semibold">
            Платформа для безопасного онлайн-тестирования
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight text-white">
            Система онлайн-экзаменов с AI-прокторингом
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            ExamGuard Proctor — это современная веб-платформа для проведения экзаменов студентов с автоматическим контролем времени, сохранением ответов и фиксацией нарушений с помощью ИИ.
          </p>
          <div className="flex gap-4">
            {user ? (
              <Link to={user.role === 'TEACHER' ? '/teacher' : '/student'} className="btn-primary">
                В личный кабинет
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-primary">Войти</Link>
                <Link to="/register" className="btn-ghost">Регистрация</Link>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-dark space-y-2">
            <div className="text-sm font-semibold text-emerald-400">💡 Как это работает?</div>
            <h3 className="text-xl font-bold">Контроль экзамена в реальном времени</h3>
            <p className="text-slate-400 text-sm">
              Таймер, статусы доступа и предупреждения работают автоматически. TensorFlow.js считывает видеопоток веб-камеры и отслеживает присутствие лица во избежание списывания.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="card-dark">
              <div className="text-3xl font-black text-emerald-400">3</div>
              <div className="mt-1 text-sm text-slate-400">предупреждения до автозавершения</div>
            </div>
            <div className="card-dark">
              <div className="text-3xl font-black text-emerald-400">100%</div>
              <div className="mt-1 text-sm text-slate-400">автоматический экспорт отчетов</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-ink-600 pt-10">
        <h2 className="text-2xl font-bold text-center text-white mb-8">Наши преимущества</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map(([title, text]) => (
            <div key={title} className="card-dark hover:border-emerald-500/50 transition-all duration-300">
              <h3 className="font-bold text-white text-lg">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
