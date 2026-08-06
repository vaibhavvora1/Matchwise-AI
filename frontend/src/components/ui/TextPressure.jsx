import React, { useEffect, useRef, useState } from 'react'

/**
 * TextPressure Component
 * Letters respond to cursor proximity/movement with font-weight, width, scale, and warm glow shifts.
 * Gives headlines a living, interactive feel while maintaining accessibility and readability.
 */
export default function TextPressure({
  text = 'Turn job search anxiety into your next job offer.',
  className = '',
  minWeight = 400,
  maxWeight = 900,
  radius = 180,
  accentColor = '#d97706',
  defaultColor = '#18181b',
  textAlign = 'left',
}) {
  const containerRef = useRef(null)
  const lettersRef = useRef([])
  const [isHovered, setIsHovered] = useState(false)
  const animFrameId = useRef(null)
  const mousePos = useRef({ x: -1000, y: -1000 })
  const targetWeights = useRef([])
  const currentWeights = useRef([])

  const words = text.split(' ')

  useEffect(() => {
    lettersRef.current = lettersRef.current.slice(0, text.length)
    targetWeights.current = new Array(text.length).fill(minWeight)
    currentWeights.current = new Array(text.length).fill(minWeight)
  }, [text, minWeight])

  useEffect(() => {
    // Respect users who prefer reduced motion
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Detect touch/no-hover devices — on those devices there's no cursor, so disable proximity interactions
    const canHover = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: hover)').matches

    if (!canHover || prefersReduced) {
      // Ensure a clean state for touch/reduced-motion devices
      mousePos.current = { x: -1000, y: -1000 }
      setIsHovered(false)
      return
    }

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      if (!isHovered) setIsHovered(true)
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      mousePos.current = { x: -1000, y: -1000 }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseleave', handleMouseLeave)
      window.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isHovered])

  // Animation Loop for smooth weight & proximity response
  useEffect(() => {
    // Respect reduced motion and touch devices — short-circuit heavy animation loop
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canHover = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: hover)').matches

    if (!canHover || prefersReduced) {
      // Apply a lightweight static rendering: set base weight & color and skip RAF loop
      lettersRef.current.forEach((el, idx) => {
        if (!el) return
        const w = Math.round(minWeight)
        el.style.fontWeight = w
        el.style.fontVariationSettings = `'wght' ${w}`
        el.style.color = defaultColor
        el.style.textShadow = 'none'
        el.style.transform = 'none'
      })
      return
    }

    let time = 0

    const updateLetterWeights = () => {
      time += 0.05

      lettersRef.current.forEach((el, idx) => {
        if (!el) return

        if (isHovered && mousePos.current.x > -500) {
          const rect = el.getBoundingClientRect()
          const charX = rect.left + rect.width / 2
          const charY = rect.top + rect.height / 2
          const dist = Math.hypot(mousePos.current.x - charX, mousePos.current.y - charY)

          if (dist < radius) {
            const factor = Math.pow(1 - dist / radius, 1.5)
            targetWeights.current[idx] = minWeight + factor * (maxWeight - minWeight)
          } else {
            targetWeights.current[idx] = minWeight
          }
        } else {
          // Idle breathing wave
          const wave = Math.sin(time + idx * 0.35) * 0.5 + 0.5
          targetWeights.current[idx] = minWeight + wave * 140
        }

        // Interpolate current weight towards target weight
        currentWeights.current[idx] += (targetWeights.current[idx] - currentWeights.current[idx]) * 0.15
        const w = Math.round(currentWeights.current[idx])

        // Proximity glow & style application
        const isNear = targetWeights.current[idx] > minWeight + 100
        el.style.fontWeight = w
        el.style.fontVariationSettings = `'wght' ${w}`
        el.style.color = isNear ? accentColor : defaultColor
        el.style.textShadow = isNear
          ? `0 0 20px rgba(217, 119, 6, 0.4), 0 0 35px rgba(245, 158, 11, 0.2)`
          : 'none'
        el.style.transform = isNear ? `scale(1.06) translateY(-2px)` : 'scale(1) translateY(0)'
      })

      animFrameId.current = requestAnimationFrame(updateLetterWeights)
    }

    animFrameId.current = requestAnimationFrame(updateLetterWeights)

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current)
    }
  }, [isHovered, minWeight, maxWeight, radius, accentColor, defaultColor])

  let letterCount = 0

  return (
    <div
      ref={containerRef}
      className={`text-pressure-wrapper ${className}`}
      aria-label={text}
      style={{
        display: 'block',
        cursor: 'default',
        userSelect: 'none',
        textAlign: textAlign,
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.5rem, 4.8vw, 4.4rem)',
          lineHeight: 1.1,
          letterSpacing: '-0.025em',
          color: defaultColor,
          margin: 0,
          textAlign: textAlign,
        }}
      >
        {words.map((word, wordIdx) => {
          const wordChars = word.split('')
          return (
            <span
              key={wordIdx}
              style={{
                display: 'inline-block',
                whiteSpace: 'nowrap',
                marginRight: '0.28em',
              }}
            >
              {wordChars.map((char, charIdx) => {
                const flatIndex = letterCount++
                return (
                  <span
                    key={charIdx}
                    ref={(el) => (lettersRef.current[flatIndex] = el)}
                    style={{
                      display: 'inline-block',
                      transition: 'transform 0.12s ease-out, color 0.15s ease-out',
                      willChange: 'transform, font-weight, color',
                    }}
                  >
                    {char}
                  </span>
                )
              })}
            </span>
          )
        })}
      </h1>
    </div>
  )
}
