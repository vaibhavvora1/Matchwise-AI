const Divider = ({ label = 'or' }) => {
  return (
    <div className="relative my-6 flex items-center text-xs uppercase tracking-[0.35em] text-[#71717A]">
      <span className="absolute left-0 right-0 top-1/2 h-px bg-[#E4E4E7]" />
      <span className="relative mx-auto bg-white px-3">{label}</span>
    </div>
  )
}

export default Divider
