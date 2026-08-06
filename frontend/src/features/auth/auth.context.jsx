import { useEffect, useRef, useState } from 'react'
import { getUserProfile, refreshAccessToken, setAuthHeader, setCsrfHeader } from './services/auth.api.jsx'
import { registerRefreshHandlers, clearRefreshHandlers } from '../../services/httpClient'
import { AuthContext } from './auth.context.store.jsx'
export { AuthContext } from './auth.context.store.jsx'

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [accessToken, setAccessToken] = useState(() => sessionStorage.getItem('accessToken'))
  const [csrfToken, setCsrfToken] = useState(() => sessionStorage.getItem('csrfToken'))
  const [isAuthReady, setIsAuthReady] = useState(false)
  // Guard: run initializeAuth only once on mount, not on every token change
  const initRan = useRef(false)

  useEffect(() => {
    if (accessToken) {
      sessionStorage.setItem('accessToken', accessToken)
      setAuthHeader(accessToken)
    } else {
      sessionStorage.removeItem('accessToken')
      setAuthHeader(null)
    }
  }, [accessToken])

  useEffect(() => {
    if (csrfToken) {
      sessionStorage.setItem('csrfToken', csrfToken)
      setCsrfHeader(csrfToken)
    } else {
      sessionStorage.removeItem('csrfToken')
      setCsrfHeader(null)
    }
  }, [csrfToken])

  useEffect(() => {
    registerRefreshHandlers({
      onTokenRefreshed: ({ accessToken: refreshedAccessToken, csrfToken: refreshedCsrfToken }) => {
        if (refreshedAccessToken) setAccessToken(refreshedAccessToken)
        if (refreshedCsrfToken) setCsrfToken(refreshedCsrfToken)
      },
      onRefreshFailed: () => {
        setAccessToken(null)
        setCsrfToken(null)
        setUser(null)
      },
    })

    return () => {
      clearRefreshHandlers()
    }
  }, [])

  // Run once on mount — not on every accessToken change to avoid loop
  useEffect(() => {
    if (initRan.current) return
    initRan.current = true

    const initializeAuth = async () => {
      // Read from sessionStorage directly to avoid stale closure
      const storedToken = sessionStorage.getItem('accessToken')
      try {
        if (storedToken) {
          setAuthHeader(storedToken)
          const profileData = await getUserProfile()
          if (profileData?.user) {
            setUser(profileData.user)
          }
        } else {
          const refreshData = await refreshAccessToken()
          if (refreshData?.accessToken) {
            setAccessToken(refreshData.accessToken)
          }
          if (refreshData?.csrfToken) {
            setCsrfToken(refreshData.csrfToken)
          }

          if (refreshData?.accessToken) {
            const profileData = await getUserProfile()
            if (profileData?.user) {
              setUser(profileData.user)
            }
          }
        }
      } catch {
        setUser(null)
        setAccessToken(null)
        setCsrfToken(null)
      } finally {
        setIsAuthReady(true)
      }
    }

    initializeAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        setLoading,
        accessToken,
        setAccessToken,
        csrfToken,
        setCsrfToken,
        isAuthReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
