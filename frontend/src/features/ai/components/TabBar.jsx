import { useState, useRef, useLayoutEffect } from 'react'
import { motion } from 'framer-motion'

const TabBar = ({ tabs, activeIndex, onChange }) => {
  const tabRefs = useRef([])
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  useLayoutEffect(() => {
    const el = tabRefs.current[activeIndex]
    if (el) {
      setIndicatorStyle({ left: el.offsetLeft, width: el.offsetWidth })
    }
  }, [activeIndex])

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      borderBottom: '2px solid var(--color-border)',
      gap: '0',
      overflowX: 'auto',
      scrollbarWidth: 'none',
    }}>
      {/* Sliding indicator */}
      <motion.div
        animate={indicatorStyle}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{
          position: 'absolute',
          bottom: '-2px',
          height: '2px',
          background: 'var(--color-highlight)',
          borderRadius: '999px',
          zIndex: 1,
        }}
      />

      {tabs.map((tab, i) => {
        const label = typeof tab === 'string' ? tab : tab?.label || ''
        const slug = label.toLowerCase().replace(/\s+/g, '-')

        return (
          <button
            key={i}
            ref={el => tabRefs.current[i] = el}
            onClick={() => onChange(i)}
            id={`tab-${slug}`}
            style={{
              padding: '14px 20px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontWeight: activeIndex === i ? 600 : 500,
              fontSize: '0.9rem',
              color: activeIndex === i ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              whiteSpace: 'nowrap',
              transition: 'color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={e => {
              if (activeIndex !== i) e.currentTarget.style.color = 'var(--color-text-primary)'
            }}
            onMouseLeave={e => {
              if (activeIndex !== i) e.currentTarget.style.color = 'var(--color-text-secondary)'
            }}
          >
            {tab.icon && tab.icon}
            {label}
            {tab.count !== undefined && (
              <span style={{
                background: activeIndex === i ? 'var(--color-indigo-100)' : '#F4F4F5',
                color: activeIndex === i ? 'var(--color-highlight)' : 'var(--color-text-muted)',
                borderRadius: '999px',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 7px',
                transition: 'all 0.2s',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        )
      })}

      <style>{`::-webkit-scrollbar { display: none; }`}</style>
    </div>
  )
}

export default TabBar
