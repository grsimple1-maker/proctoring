export default function Button({ variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    ghost: 'border border-ink-600 hover:bg-ink-700 text-slate-200',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    soft: 'bg-ink-700 hover:bg-ink-600 text-slate-200',
  };
  return <button {...props} className={`px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`} />;
}
