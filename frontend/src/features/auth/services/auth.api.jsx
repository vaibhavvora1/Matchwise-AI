import api, { setAuthHeader, setCsrfHeader } from '../../../services/httpClient'

export { setAuthHeader, setCsrfHeader }

export async function register({ username, email, password }) {
  try {
    const response = await api.post('/auth/register', { username, email, password })
    return response.data
  } catch (err) {
    console.error('[auth.api]', err)
    throw err
  }
}

export async function login({ email, password }) {
  try {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  } catch (err) {
    console.error('[auth.api]', err)
    throw err
  }
}

export async function refreshAccessToken() {
  try {
    const response = await api.post('/auth/refresh')
    return response.data
  } catch (err) {
    // 401 here just means "no valid session yet" (e.g. first visit, expired/cleared cookie)
    // — this is an expected outcome, not a real error, so don't spam the console for it.
    if (err.response?.status !== 401) {
      console.error('[auth.api]', err)
    }
    throw err
  }
}

export async function logout() {
  try {
    const response = await api.post('/auth/logout', { logout: true })
    return response.data
  } catch (err) {
    console.error('[auth.api]', err)
    throw err
  }
}

export async function logoutAllDevices() {
  try {
    const response = await api.post('/auth/logout-all', { logoutAll: true })
    return response.data
  } catch (err) {
    console.error('[auth.api]', err)
    throw err
  }
}

export async function getUserProfile() {
  try {
    const response = await api.get('/user/profile')
    return response.data
  } catch (err) {
    console.error('[auth.api]', err)
    throw err
  }
}

export async function getUserAggregation() {
  try {
    const response = await api.get('/user/aggregation')
    return response.data
  } catch (err) {
    console.error('[auth.api]', err)
    throw err
  }
}