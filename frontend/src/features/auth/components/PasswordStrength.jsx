const strengthMap = [
  { label: 'Weak', color: '#EF4444' },
  { label: 'Medium', color: '#F59E0B' },
  { label: 'Strong', color: '#22C55E' },
]

const PasswordStrength = ({ score, criteria }) => {
  const strength = strengthMap[Math.min(score, strengthMap.length - 1)]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm font-medium text-[#09090B]">
        <span>Password strength</span>
        <span className="text-sm font-semibold" style={{ color: strength.color }}>
          {strength.label}
        </span>
      </div>
      <div className="rounded-full bg-[#E4E4E7] p-[3px]">
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{
            width: `${(score + 1) * 33}%`,
            background: strength.color,
          }}
        />
      </div>
      <div className="grid gap-2 text-sm text-[#71717A]">
        {criteria.map((item) => (
          <div className="flex items-center gap-2" key={item.label}>
            <span className={`h-3 w-3 shrink-0 rounded-full ${item.met ? 'bg-[#22C55E]' : 'bg-[#E4E4E7]'}`} />
            <span className={item.met ? 'text-[#09090B]' : 'text-[#71717A]'}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PasswordStrength
