import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import InputField from '../components/InputField'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { useAuth } from '../hooks/userAuth'

const LoginPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { handleLogin } = useAuth()
  const shouldReduceMotion = useReducedMotion()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm({ mode: 'onBlur' })

  const onSubmit = async (formData) => {
    setServerError('')
    setLoading(true)
    try {
      await handleLogin({ email: formData.email, password: formData.password })
      navigate('/analyze')
    } catch (error) {
      setServerError(error?.response?.data?.message || 'Unable to login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p className="section-label" style={{ marginBottom: '12px' }}>Welcome back</p>
        <h2
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--color-text-primary)',
            marginBottom: '8px',
          }}
        >
          Sign in to MatchWise AI
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Enter your email and password to continue.
        </p>
      </div>

      <motion.form
        onSubmit={handleSubmit(onSubmit)}
        initial={false}
        animate={isSubmitted && Object.keys(errors).length ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        <InputField
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          icon={<span>📧</span>}
          autoComplete="email"
          register={register}
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Please enter a valid email address',
            },
          }}
          error={errors.email}
        />

        <InputField
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          icon={<span>🔒</span>}
          autoComplete="current-password"
          register={register}
          rules={{
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          }}
          error={errors.password}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-highlight)',
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          }
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
          <motion.button
            type="submit"
            disabled={loading}
            className={`btn btn-lg ${loading ? 'btn-loading' : 'btn-indigo'}`}
            whileHover={!loading && !shouldReduceMotion ? { scale: 1.02, y: -1 } : {}}
            whileTap={!loading && !shouldReduceMotion ? { scale: 0.98 } : {}}
            style={{ width: '100%' }}
          >
            {loading ? (
              <>
                <LoadingSpinner size={18} color="white" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </motion.button>

          {shouldReduceMotion ? (
            serverError && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#B91C1C',
                  fontSize: '0.9rem',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {serverError}
              </div>
            )
          ) : (
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#B91C1C',
                    fontSize: '0.9rem',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {serverError}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.form>

      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '28px' }}>
        New to MatchWise AI?{' '}
        <Link to="/register" style={{ fontWeight: 600, color: 'var(--color-highlight)' }}>
          Create an account
        </Link>
      </p>
    </>
  )
}

export default LoginPage