import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_ADMIN_API_URL?.replace(/\/$/, '') || 'http://localhost:4000/api/admin'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
})

let isRefreshing = false
let refreshSubscribers = []
let onRefreshedCallback = null
let onRefreshFailedCallback = null

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export const registerRefreshCallbacks = ({ onRefreshed, onFailed }) => {
  onRefreshedCallback = onRefreshed
  onRefreshFailedCallback = onFailed
}

const notifyRefreshSuccess = (newToken) => {
  if (onRefreshedCallback) onRefreshedCallback(newToken)
  refreshSubscribers.forEach((cb) => cb.resolve(newToken))
  refreshSubscribers = []
}

const notifyRefreshFailure = (error) => {
  if (onRefreshFailedCallback) onRefreshFailedCallback(error)
  refreshSubscribers.forEach((cb) => cb.reject(error))
  refreshSubscribers = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const url = originalRequest?.url || ''

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !url.includes('/auth/login') &&
      !url.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push({ resolve, reject })
        }).then((newToken) => {
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        )

        const newToken = refreshResponse.data?.accessToken
        if (newToken) {
          setAuthToken(newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          notifyRefreshSuccess(newToken)
          return api(originalRequest)
        }
      } catch (refreshErr) {
        notifyRefreshFailure(refreshErr)
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api
