export const Skeleton = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-800/60 rounded-xl ${className}`}
    />
  )
}

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full space-y-3 p-4">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 py-2 border-b border-slate-800/40">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={c}
              className={`h-6 ${
                c === 0 ? 'w-1/3' : c === 1 ? 'w-1/4' : 'flex-1'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default Skeleton
