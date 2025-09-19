export function DataPlaceholder({ icon, title, description, action }) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-slate-900/60 p-8 text-center text-slate-300">
      {icon ? <div className="text-4xl text-primary-300">{icon}</div> : null}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description ? <p className="text-sm text-slate-400">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
