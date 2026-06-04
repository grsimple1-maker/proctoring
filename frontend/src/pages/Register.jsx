import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import Field from '../components/Field';
import Button from '../components/Button';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Пароли не совпадают');
    }
    if (password.length < 6) {
      return toast.error('Пароль должен быть не менее 6 символов');
    }
    try {
      await api.post('/auth/register', { fullName, email, password, role });
      toast.success('Регистрация успешна! Теперь вы можете войти');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка регистрации');
    }
  };

  return (
    <div className="max-w-md mx-auto card-dark mt-10 space-y-6">
      <h2 className="text-2xl font-bold text-emerald-400">Регистрация</h2>

      {/* Role selector */}
      <div className="flex gap-3">
        {['STUDENT', 'TEACHER'].map(r => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
              role === r
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-ink-600 text-slate-400 hover:border-ink-500'
            }`}
          >
            {r === 'STUDENT' ? '🎓 Студент' : '📋 Преподаватель'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Field label="ФИО" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
        <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <Field label="Пароль (мин. 6 символов)" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <Field label="Подтвердите пароль" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        <Button type="submit" className="w-full">
          Зарегистрироваться как {role === 'STUDENT' ? 'студент' : 'преподаватель'}
        </Button>
        <p className="text-xs text-slate-500 text-center">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-emerald-400 hover:underline">Войти</Link>
        </p>
      </form>
    </div>
  );
}
