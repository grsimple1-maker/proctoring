export default function StatCard({ label, value, accent = 'emerald' }) {
  const accentClasses = {
    emerald: 'text-emerald-400',
    cyan: 'text-cyan-400',
    red: 'text-red-400',
  };
  const colorClass = accentClasses[accent] || accentClasses.emerald;
  return (
    <div className="card-dark">
      <div className="text-xs text-slate-400 uppercase tracking-wide">{label}</div>
      <div className={`text-3xl font-bold mt-1 ${colorClass}`}>{value}</div>
    </div>
  );
}
