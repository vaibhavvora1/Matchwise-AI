import api from './api'

export async function registerAdmin({ username, email, password, adminSecretKey }) {
  const response = await api.post('/auth/register', {
    username,
    email,
    password,
    adminSecretKey,
  })
  return response.data
}

export async function loginAdmin({ email, password }) {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export async function getAdminProfile() {
  const response = await api.get('/auth/me')
  return response.data
}

export async function refreshAdminToken() {
  const response = await api.post('/auth/refresh')
  return response.data
}

export async function logoutAdmin() {
  const response = await api.post('/auth/logout')
  return response.data
}
