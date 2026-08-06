const InputField = ({
  label,
  name,
  type = 'text',
  placeholder,
  icon,
  register,
  rules,
  error,
  autoComplete = 'off',
  rightElement,
  onChange,
}) => {
  return (
    <div className="space-y-3">
      <label htmlFor={name} className="block text-sm font-medium text-[#09090B]">
        {label}
      </label>
      <div
        className={`flex items-center gap-3 rounded-[10px] border px-4 py-3 bg-[#F4F4F5] transition focus-within:border-[#6366F1] ${
          error ? 'border-[#EF4444]' : 'border-[#E4E4E7]'
        }`}
      >
        {icon && <span className="text-[#71717A]">{icon}</span>}
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent text-sm text-[#09090B] outline-none placeholder:text-[#A1A1AA]"
          onChange={onChange}
          {...register(name, rules)}
        />
        {rightElement && <span className="text-[#71717A]">{rightElement}</span>}
      </div>
      {error && (
        <p className="text-sm font-medium text-[#EF4444]" role="alert">
          {error.message}
        </p>
      )}
    </div>
  )
}

export default InputField
