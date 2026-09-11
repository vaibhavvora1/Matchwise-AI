import api from './api'

export async function getUsersList({
  page = 1,
  limit = 15,
  search = '',
  role = '',
  status = '',
  sortBy = 'createdAt',
  sortOrder = 'desc',
} = {}) {
  const params = new URLSearchParams()
  params.set('page', page)
  params.set('limit', limit)
  if (search) params.set('search', search)
  if (role) params.set('role', role)
  if (status) params.set('status', status)
  if (sortBy) params.set('sortBy', sortBy)
  if (sortOrder) params.set('sortOrder', sortOrder)

  const response = await api.get(`/users?${params.toString()}`)
  return response.data
}

export async function getUserDetail(id) {
  const response = await api.get(`/users/${id}`)
  return response.data
}

export async function updateUserStatus(id, isActive) {
  const response = await api.patch(`/users/${id}/status`, { isActive })
  return response.data
}

export async function updateUserRole(id, role) {
  const response = await api.patch(`/users/${id}/role`, { role })
  return response.data
}
