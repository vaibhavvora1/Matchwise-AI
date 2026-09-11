import api from '../../../services/httpClient'

/**
 * Submit new user feedback.
 * Works for authenticated users (userId attached server-side) and anonymous visitors.
 * Do NOT send userId from the frontend — the backend determines it from the auth token.
 */
export async function submitFeedback({ rating, type, message }) {
  const response = await api.post('/feedback', { rating, type, message })
  return response.data
}

/**
 * Fetch approved reviews for display on the public landing page.
 */
export async function getApprovedReviews({ page = 1, limit = 6 } = {}) {
  const params = new URLSearchParams()
  params.set('page', page)
  params.set('limit', limit)

  const response = await api.get(`/feedback/reviews?${params.toString()}`)
  return response.data
}

// NOTE: Admin feedback functions (getAdminFeedback, updateFeedbackStatus, deleteFeedback)
// have been removed from the public application.
// Feedback administration is handled exclusively by the Admin Server at localhost:4000.
// Use the Admin Panel at localhost:3001 to manage feedback.
