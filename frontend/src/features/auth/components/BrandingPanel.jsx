import { motion } from 'framer-motion'

const featureCards = [
  {
    title: 'ATS Resume Optimizer',
    description: 'Tailored resumes that pass ATS filters',
  },
  {
    title: 'Interview Coach',
    description: 'AI-generated questions and answers for your role',
  },
  {
    title: 'Skill Gap Analyzer',
    description: 'Know exactly what to learn before your interview',
  },
]

const BrandingPanel = () => {
  return (
    <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#4F46E5] via-[#6366F1] to-[#818CF8] px-8 py-10 text-white md:flex">
      <div className="relative z-10 flex flex-col gap-8">
        <div className="space-y-4">
          <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/85 backdrop-blur-sm">
            MatchWise AI</div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight tracking-[-0.04em]">Build Resumes That Beat ATS. Ace Every Interview.</h1>
          <p className="max-w-sm text-sm leading-6 text-white/80">
            MatchWise AI helps ambitious professionals build career-changing resumes, prepare for interviews, and close the gap to their next role.
          </p>
        </div>

        <div className="grid gap-4">
          {featureCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 * index, duration: 0.5, ease: 'easeOut' }}
              className="rounded-[24px] border border-white/20 bg-white/10 p-5 shadow-[0_20px_50px_-30px_rgba(255,255,255,0.35)] backdrop-blur-xl"
            >
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-white/75">✦ {card.title}</p>
              <p className="text-sm leading-6 text-white/90">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative mt-6 flex flex-col gap-4 rounded-[28px] border border-white/15 bg-white/10 p-5 text-sm text-white/90 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {['#E0E7FF', '#A5B4FC', '#C7D2FE', '#DDD6FE'].map((color, index) => (
              <span
                key={index}
                className="h-10 w-10 rounded-full border border-white/30"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/70">Trusted by</p>
            <p className="text-base font-semibold">10,000+ job seekers</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/85">
          {'★★★★★'.split('').map((star, index) => (
            <span key={index} className="text-yellow-300">{star}</span>
          ))}
          <span className="ml-2 text-white/70">4.9 rating</span>
        </div>
      </div>
    </section>
  )
}

export default BrandingPanel
