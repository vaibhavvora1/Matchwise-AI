import { useMemo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/userAuth'

const SecureRoute = ({ children }) => {
  const { accessToken, isAuthReady } = useAuth()
  const location = useLocation()

  const isAuthenticated = useMemo(() => Boolean(accessToken), [accessToken])

  if (!isAuthReady) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default SecureRoute
