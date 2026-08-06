import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * SVG circular progress animated by GSAP.
 * @param {number} value - 0 to 100
 * @param {number} size - SVG diameter
 * @param {number} strokeWidth
 * @param {string} color - stroke color
 */
const CircularProgress = ({ value = 0, size = 140, strokeWidth = 10, color = '#6366F1' }) => {
  const circleRef = useRef(null)
  const textRef = useRef(null)

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  useEffect(() => {
    if (!circleRef.current || !textRef.current) return

    // Start from 0
    gsap.set(circleRef.current, { strokeDashoffset: circumference })
    const obj = { val: 0 }

    gsap.to(obj, {
      val: value,
      duration: 1.6,
      ease: 'power3.out',
      delay: 0.4,
      onUpdate: () => {
        const offset = circumference - (obj.val / 100) * circumference
        if (circleRef.current) circleRef.current.style.strokeDashoffset = offset
        if (textRef.current) textRef.current.textContent = Math.round(obj.val)
      },
    })
  }, [value, circumference])

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#F4F4F5"
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <circle
        ref={circleRef}
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        style={{ transition: 'stroke 0.3s' }}
      />
      {/* Text (rotated back) */}
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          transform: `rotate(90deg)`,
          transformOrigin: `${center}px ${center}px`,
          fontSize: `${size * 0.2}px`,
          fontWeight: 800,
          fontFamily: 'Inter, sans-serif',
          fill: color,
          letterSpacing: '-0.03em',
        }}
        ref={textRef}
      >
        0
      </text>
    </svg>
  )
}

export default CircularProgress
