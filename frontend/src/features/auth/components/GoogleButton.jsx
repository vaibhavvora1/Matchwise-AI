import { motion } from 'framer-motion'

const GoogleButton = ({ label, onClick, disabled }) => {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex w-full items-center justify-center gap-3 rounded-[10px] border border-[#E4E4E7] bg-white px-4 py-3 text-sm font-semibold text-[#09090B] transition hover:border-[#6366F1] hover:text-[#09090B] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F4F4F5]">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
          <path d="M23.51 12.23c0-.77-.07-1.51-.21-2.23H12v4.24h6.48c-.28 1.44-1.07 2.66-2.28 3.48v2.88h3.68c2.14-1.98 3.42-4.88 3.42-8.37z" fill="#4285F4" />
          <path d="M12 24c2.97 0 5.47-.98 7.29-2.65l-3.68-2.88c-1.03.7-2.36 1.11-3.61 1.11-2.78 0-5.13-1.88-5.97-4.41H2.62v2.76A11.98 11.98 0 0012 24z" fill="#34A853" />
          <path d="M6.03 14.17a7.17 7.17 0 010-4.34V7.07H2.62a11.99 11.99 0 000 9.86l3.41-2.76z" fill="#FBBC05" />
          <path d="M12 4.78c1.62 0 3.08.56 4.23 1.66l3.17-3.17C17.45 1.38 14.97.5 12 .5 7.63.5 3.94 2.77 2.62 6.03l3.41 2.76C6.87 6.82 9.22 4.78 12 4.78z" fill="#EA4335" />
        </svg>
      </span>
      {label}
    </motion.button>
  )
}

export default GoogleButton
