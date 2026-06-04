import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield, LogOut } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <header className="border-b border-ink-600 bg-ink-800/80 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
          <Shield size={22} /> ExamGuard Proctor
        </Link>
        {user ? (
          <div className="flex items-center gap-4">
            <Link to={user.role === 'TEACHER' ? '/teacher' : '/student'} className="text-slate-300 hover:text-white font-semibold transition-colors duration-200">
              {user.fullName}
            </Link>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 flex items-center gap-1 font-semibold transition-colors duration-200">
              <LogOut size={16} /> Выйти
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link to="/login" className="btn-ghost">Войти</Link>
            <Link to="/register" className="btn-primary">Регистрация</Link>
          </div>
        )}
      </div>
    </header>
  );
}
