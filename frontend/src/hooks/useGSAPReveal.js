import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Fade-up reveal on scroll using GSAP ScrollTrigger.
 * @param {object} options - GSAP/ScrollTrigger options
 */
export const useGSAPReveal = (options = {}) => {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const targets = el.querySelectorAll('[data-reveal]')
    if (!targets.length) return

    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      // Make targets visible immediately without animation
      targets.forEach((t) => {
        t.style.opacity = 1
        t.style.transform = 'none'
      })
      return
    }

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: options.stagger ?? 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: options.start ?? 'top 80%',
          once: true,
          ...options.scrollTrigger,
        },
      })
    }, el)

    return () => ctx.revert()
  }, [options.stagger, options.start])

  return ref
}

/**
 * Hero staggered text reveal (word by word) using GSAP.
 * @param {React.RefObject} containerRef - ref to the container
 */
export const useHeroReveal = (containerRef) => {
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const words = el.querySelectorAll('[data-hero-word]')
    const lines = el.querySelectorAll('[data-hero-line]')
    const fades = el.querySelectorAll('[data-hero-fade]')

      const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      // Make content visible immediately
      ;[...words, ...lines, ...fades].forEach((n) => {
        if (n) {
          n.style.opacity = 1
          n.style.transform = 'none'
        }
      })
      return
    }

    const ctx = gsap.context(() => {
      // Set initial state
      gsap.set([...words, ...lines, ...fades], { opacity: 0 })

      const tl = gsap.timeline({ delay: 0.2 })

      if (words.length) {
        tl.to(words, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: 'power3.out',
        }, 0)
      }

      if (lines.length) {
        tl.to(lines, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
        }, 0.4)
      }

      if (fades.length) {
        tl.to(fades, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out',
        }, 0.7)
      }
    }, el)

    return () => ctx.revert()
  }, [containerRef])
}

/**
 * Animated counter from 0 to a target value using GSAP.
 */
export const useGSAPCounter = (ref, target, options = {}) => {
  useEffect(() => {
    if (!ref.current || target === null || target === undefined) return

    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const obj = { value: 0 }

    if (prefersReduced) {
      // Immediately set the text to target value
      if (ref.current) ref.current.textContent = Math.round(target) + (options.suffix ?? '')
      return
    }

    const ctx = gsap.context(() => {
      gsap.to(obj, {
        value: target,
        duration: options.duration ?? 1.5,
        ease: options.ease ?? 'power2.out',
        delay: options.delay ?? 0.3,
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = Math.round(obj.value) + (options.suffix ?? '')
          }
        },
        scrollTrigger: options.scrollTrigger ? {
          trigger: ref.current,
          start: 'top 80%',
          once: true,
        } : undefined,
      })
    })

    return () => ctx.revert()
  }, [target, ref])
}
