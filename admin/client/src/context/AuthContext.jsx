import { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  getAdminProfile,
  loginAdmin,
  registerAdmin,
  logoutAdmin,
  refreshAdminToken,
} from '../services/auth.api'
import { registerRefreshCallbacks, setAuthToken } from '../services/api'
import { disconnectSocket, getSocket } from '../services/socket'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null)
  const [token, setToken] = useState(() => sessionStorage.getItem('adminAccessToken') || null)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const initRan = useRef(false)

  // Synchronize token state with API header and session storage
  useEffect(() => {
    if (token) {
      sessionStorage.setItem('adminAccessToken', token)
      setAuthToken(token)
      getSocket(token)
    } else {
      sessionStorage.removeItem('adminAccessToken')
      setAuthToken(null)
      disconnectSocket()
    }
  }, [token])

  // Register Axios refresh interceptor callbacks
  useEffect(() => {
    registerRefreshCallbacks({
      onRefreshed: (newToken) => {
        setToken(newToken)
      },
      onFailed: () => {
        setToken(null)
        setAdminUser(null)
      },
    })
  }, [])

  // Initialize session on initial mount
  useEffect(() => {
    if (initRan.current) return
    initRan.current = true

    const initAuth = async () => {
      const storedToken = sessionStorage.getItem('adminAccessToken')
      try {
        if (storedToken) {
          setAuthToken(storedToken)
          const profileData = await getAdminProfile()
          if (profileData?.user && profileData.user.role === 'admin') {
            setAdminUser(profileData.user)
          } else {
            throw new Error('Not an admin')
          }
        } else {
          // Attempt cookie-based refresh
          const refreshData = await refreshAdminToken()
          if (refreshData?.accessToken) {
            setToken(refreshData.accessToken)
            setAuthToken(refreshData.accessToken)
            if (refreshData?.user) {
              setAdminUser(refreshData.user)
            } else {
              const profileData = await getAdminProfile()
              setAdminUser(profileData.user)
            }
          }
        }
      } catch (err) {
        setToken(null)
        setAdminUser(null)
      } finally {
        setIsAuthReady(true)
      }
    }

    initAuth()
  }, [])

  const register = async ({ username, email, password, adminSecretKey }) => {
    setLoading(true)
    try {
      const data = await registerAdmin({ username, email, password, adminSecretKey })
      if (data.accessToken && data.user) {
        setToken(data.accessToken)
        setAdminUser(data.user)
        return data
      }
      throw new Error(data.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    setLoading(true)
    try {
      const data = await loginAdmin({ email, password })
      if (data.accessToken && data.user) {
        setToken(data.accessToken)
        setAdminUser(data.user)
        return data
      }
      throw new Error(data.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await logoutAdmin()
    } catch (err) {
      console.warn('[Admin Auth] Logout error (clearing local session):', err.message)
    } finally {
      setToken(null)
      setAdminUser(null)
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        token,
        isAuthReady,
        loading,
        register,
        login,
        logout,
        isAuthenticated: Boolean(adminUser && adminUser.role === 'admin'),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
