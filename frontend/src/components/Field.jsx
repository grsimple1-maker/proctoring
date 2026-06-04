export default function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-400 mb-1 block">{label}</span>
      <input {...props} className="w-full bg-ink-900 border border-ink-600 rounded-lg px-3 py-2 focus:border-emerald-500 outline-none transition" />
    </label>
  );
}
