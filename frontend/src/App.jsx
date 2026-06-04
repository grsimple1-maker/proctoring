import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Exam from './pages/Exam';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-20 text-slate-400">Загрузка...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

export default function App() {
  return (
    <div className="min-h-screen bg-ink-900 text-slate-200 flex flex-col">
      <Header />
      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/teacher" element={<PrivateRoute role="TEACHER"><TeacherDashboard /></PrivateRoute>} />
          <Route path="/student" element={<PrivateRoute role="STUDENT"><StudentDashboard /></PrivateRoute>} />
          <Route path="/exam/:testId" element={<PrivateRoute role="STUDENT"><Exam /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
