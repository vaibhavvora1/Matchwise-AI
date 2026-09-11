import api from './api'

export async function getFeedbackList({
  page = 1,
  limit = 15,
  search = '',
  status = '',
  type = '',
  rating = '',
  sortBy = 'createdAt',
  sortOrder = 'desc',
} = {}) {
  const params = new URLSearchParams()
  params.set('page', page)
  params.set('limit', limit)
  if (search) params.set('search', search)
  if (status) params.set('status', status)
  if (type) params.set('type', type)
  if (rating) params.set('rating', rating)
  if (sortBy) params.set('sortBy', sortBy)
  if (sortOrder) params.set('sortOrder', sortOrder)

  const response = await api.get(`/feedback?${params.toString()}`)
  return response.data
}

export async function getFeedbackDetail(id) {
  const response = await api.get(`/feedback/${id}`)
  return response.data
}

export async function updateFeedbackStatus(id, status) {
  const response = await api.patch(`/feedback/${id}/status`, { status })
  return response.data
}

export async function deleteFeedback(id) {
  const response = await api.delete(`/feedback/${id}`)
  return response.data
}
