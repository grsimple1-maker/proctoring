import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import Field from '../components/Field';
import Button from '../components/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      toast.success('Вход выполнен');
      navigate(user.role === 'TEACHER' ? '/teacher' : '/student');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка входа');
    }
  };

  return (
    <div className="max-w-md mx-auto card-dark mt-10 space-y-6">
      <h2 className="text-2xl font-bold text-emerald-400">Вход в систему</h2>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <Field label="Пароль" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <Button type="submit" className="w-full">Войти</Button>
        <p className="text-xs text-slate-500 text-center">
          Демо: teacher@test.ru / student@test.ru, пароль: 123
        </p>
      </form>
    </div>
  );
}
