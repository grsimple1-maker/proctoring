export default function StatusPill({ status }) {
  const map = {
    COMPLETED: { c: 'bg-emerald-500/20 text-emerald-300', t: 'Завершён успешно' },
    VIOLATION: { c: 'bg-red-500/20 text-red-300', t: 'Нарушение правил' },
    IN_PROGRESS: { c: 'bg-cyan-500/20 text-cyan-300', t: 'В процессе' },
  };
  const s = map[status] || map.IN_PROGRESS;
  return <span className={`px-2 py-1 rounded-full text-xs ${s.c}`}>{s.t}</span>;
}
