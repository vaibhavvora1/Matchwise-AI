import api from '../../../services/httpClient'

/**
 * Get paginated analysis history for the authenticated user.
 * @param {object} params
 * @param {number} params.page
 * @param {number} params.limit
 * @param {string} params.search
 * @param {string} params.type - 'ats_resume' | 'interview_report' | ''
 */
export async function getUserHistory({ page = 1, limit = 10, search = '', type = '' } = {}) {
  const params = new URLSearchParams()
  params.set('page', page)
  params.set('limit', limit)
  if (search) params.set('search', search)
  if (type) params.set('type', type)

  const response = await api.get(`/user/history?${params.toString()}`)
  return response.data
}

/**
 * Get full report data for a single history item.
 * @param {string} id
 */
export async function getHistoryItem(id) {
  const response = await api.get(`/user/history/${id}`)
  return response.data
}

/**
 * Delete a history item by ID.
 * @param {string} id
 */
export async function deleteHistoryItem(id) {
  const response = await api.delete(`/user/history/${id}`)
  return response.data
}
