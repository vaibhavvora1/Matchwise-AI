export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'emerald',
}) => {
  const colorMap = {
    emerald: {
      bg: 'from-emerald-500/15 to-emerald-500/5',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      valueColor: 'text-white',
    },
    blue: {
      bg: 'from-blue-500/15 to-blue-500/5',
      border: 'border-blue-500/20 hover:border-blue-500/40',
      iconBg: 'bg-blue-500/20 text-blue-400',
      valueColor: 'text-white',
    },
    amber: {
      bg: 'from-amber-500/15 to-amber-500/5',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/20 text-amber-400',
      valueColor: 'text-white',
    },
    purple: {
      bg: 'from-purple-500/15 to-purple-500/5',
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/20 text-purple-400',
      valueColor: 'text-white',
    },
    rose: {
      bg: 'from-rose-500/15 to-rose-500/5',
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/20 text-rose-400',
      valueColor: 'text-white',
    },
  }

  const theme = colorMap[color] || colorMap.emerald

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${theme.bg} border ${theme.border} backdrop-blur-xl transition-all duration-300 shadow-lg`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <h3 className={`mt-2 text-3xl font-extrabold tracking-tight ${theme.valueColor}`}>
            {value}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400 font-medium">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${theme.iconBg} shadow-inner`}>
            <Icon size={24} />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-white/5 text-xs">
          <span
            className={`font-semibold ${
              trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}
          </span>
          <span className="text-slate-400">{trend.label}</span>
        </div>
      )}
    </div>
  )
}

export default StatCard
