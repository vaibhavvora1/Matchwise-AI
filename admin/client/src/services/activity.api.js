import api from './api'

/**
 * Fetch paginated activities with search, eventType, date range, and sorting.
 */
export async function getActivityList({
  page = 1,
  limit = 20,
  search = '',
  eventType = '',
  userId = '',
  startDate = '',
  endDate = '',
  sortBy = 'createdAt',
  sortOrder = 'desc',
} = {}) {
  const params = new URLSearchParams()
  params.set('page', page)
  params.set('limit', limit)
  if (search) params.set('search', search)
  if (eventType) params.set('eventType', eventType)
  if (userId) params.set('userId', userId)
  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)
  if (sortBy) params.set('sortBy', sortBy)
  if (sortOrder) params.set('sortOrder', sortOrder)

  const response = await api.get(`/activity?${params.toString()}`)
  return response.data
}

/**
 * Fetch aggregated metrics & real-time activity stats.
 */
export async function getActivityStats() {
  const response = await api.get('/activity/stats')
  return response.data
}

/**
 * Fetch paginated activity history for a single user.
 */
export async function getUserActivities(userId, { page = 1, limit = 15, eventType = '' } = {}) {
  const params = new URLSearchParams()
  params.set('page', page)
  params.set('limit', limit)
  if (eventType) params.set('eventType', eventType)

  const response = await api.get(`/activity/user/${userId}?${params.toString()}`)
  return response.data
}
