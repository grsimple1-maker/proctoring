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
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Пароли не совпадают');
    }
    try {
      await api.post('/auth/register', { fullName, email, password });
      toast.success('Регистрация успешна! Теперь вы можете войти');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка регистрации');
    }
  };

  return (
    <div className="max-w-md mx-auto card-dark mt-10 space-y-6">
      <h2 className="text-2xl font-bold text-emerald-400">Регистрация студента</h2>
      <form onSubmit={submit} className="space-y-4">
        <Field label="ФИО" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
        <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <Field label="Пароль" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <Field label="Подтвердите пароль" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        <Button type="submit" className="w-full">Зарегистрироваться</Button>
        <p className="text-xs text-slate-500 text-center">
          Уже есть аккаунт? <Link to="/login" className="text-emerald-400 hover:underline">Войти</Link>
        </p>
      </form>
    </div>
  );
}
