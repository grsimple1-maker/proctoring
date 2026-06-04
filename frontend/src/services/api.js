import axios from 'axios';

// В dev — Vite проксирует /api → localhost:4000
// В production — используем VITE_API_URL (URL задеплоенного бекенда)
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('examguard_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
