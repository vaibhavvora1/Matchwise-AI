import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import AuthLayout from '../components/AuthLayout'

const Authshell = () => {
    const location = useLocation()
    const isRegister = location.pathname === '/register'
    const shouldReduceMotion = useReducedMotion()

    return (
        <AuthLayout reverse={isRegister}>
          {shouldReduceMotion ? (
            <div style={{ width: '100%' }}>
              <Outlet />
            </div>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: isRegister ? -24 : 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRegister ? 24 : -24 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          )}
        </AuthLayout>
    )
}

export default Authshell