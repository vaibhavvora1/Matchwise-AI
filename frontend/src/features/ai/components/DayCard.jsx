import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const DAY_COLORS = [
  { bg: '#EEF2FF', accent: '#6366F1' },
  { bg: '#F0FDF4', accent: '#22C55E' },
  { bg: '#FFFBEB', accent: '#F59E0B' },
  { bg: '#FFF1F2', accent: '#F43F5E' },
  { bg: '#F0F9FF', accent: '#0EA5E9' },
  { bg: '#FAF5FF', accent: '#A855F7' },
  { bg: '#FFF7ED', accent: '#F97316' },
]

const DayCard = ({ day, focus, tasks, index }) => {
  const cardRef = useRef(null)
  const color = DAY_COLORS[(day - 1) % DAY_COLORS.length]

  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const ctx = gsap.context(() => {
      gsap.from(el, {
        x: -50,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={cardRef}
      style={{
        display: 'flex',
        gap: '24px',
        alignItems: 'flex-start',
        opacity: 1,
      }}
    >
      {/* Day indicator + line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, flexShrink: 0 }}>
        <div style={{
          width: '48px', height: '48px',
          borderRadius: '50%',
          background: color.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white',
          fontWeight: 800,
          fontSize: '0.875rem',
          boxShadow: `0 4px 14px ${color.accent}40`,
          flexShrink: 0,
        }}>
          D{day}
        </div>
        {/* Connecting line */}
        {index < 6 && (
          <div style={{
            width: '2px',
            height: '32px',
            background: 'var(--color-border)',
            marginTop: '4px',
          }} />
        )}
      </div>

      {/* Card */}
      <div
        style={{
          flex: 1,
          background: color.bg,
          borderRadius: '12px',
          padding: '20px',
          border: `1px solid ${color.accent}30`,
          marginBottom: index < 6 ? 0 : 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: color.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Day {day}
          </span>
          <div style={{ flex: 1, height: '1px', background: `${color.accent}30` }} />
        </div>
        <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: '12px' }}>
          {focus}
        </h4>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tasks.map((task, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              <div style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                background: color.accent,
                flexShrink: 0,
                marginTop: '7px',
              }} />
              {task}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default DayCard
