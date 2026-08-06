import useLenis from '../../hooks/useLenis'

/**
 * Wrapper that initializes Lenis smooth scroll.
 * Render this inside pages/layouts that need smooth scrolling.
 */
const SmoothScrollProvider = ({ children }) => {
  useLenis()
  return <>{children}</>
}

export default SmoothScrollProvider
