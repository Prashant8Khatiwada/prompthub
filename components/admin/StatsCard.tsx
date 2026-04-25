interface Props { 
  label: string; 
  value: number | string; 
  change?: number 
}

export default function StatsCard({ label, value, change }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm hover:border-zinc-700 transition-colors">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-end justify-between mt-3">
        <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
            change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600 rounded-full" style={{ width: '60%' }} />
      </div>
    </div>
  )
}
