import { motion } from 'framer-motion'

const SEVERITY_CONFIG = {
  low:    { label: 'Low',    badgeClass: 'badge-success', barColor: '#22C55E', barBg: '#DCFCE7' },
  medium: { label: 'Medium', badgeClass: 'badge-warning', barColor: '#F59E0B', barBg: '#FEF3C7' },
  high:   { label: 'High',   badgeClass: 'badge-error',   barColor: '#EF4444', barBg: '#FEE2E2' },
}

const SEV_WIDTHS = { low: '33%', medium: '66%', high: '100%' }

const SkillGapCard = ({ skill, severity, description, index }) => {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.medium

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.07,
        type: 'spring',
        stiffness: 350,
        damping: 22,
      }}
      whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
        <h4 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
          {skill}
        </h4>
        <span className={`badge ${config.badgeClass}`} style={{ flexShrink: 0 }}>
          {config.label}
        </span>
      </div>

      {/* Description */}
      {description && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.65, marginBottom: '16px' }}>
          {description}
        </p>
      )}

      {/* Severity bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
            Gap severity
          </span>
        </div>
        <div className="progress-bar-track">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: SEV_WIDTHS[severity] || '50%' }}
            transition={{ delay: index * 0.07 + 0.3, duration: 0.8, ease: 'easeOut' }}
            style={{ background: config.barColor }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default SkillGapCard
