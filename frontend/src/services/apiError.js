/**
 * Format raw API errors into clean, user-friendly messages for the UI
 */
export const getErrorMessage = (
  error,
  fallbackMessage = 'An unexpected error occurred. Please try again.'
) => {
  if (!error) return fallbackMessage

  // Timeout error
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'The request timed out. Please check your network connection and try again.'
  }

  // Network / Connection error
  if (error.message === 'Network Error' || !error.response) {
    return 'Unable to connect to MatchWise AI servers. Please check your internet connection.'
  }

  const status = error.response?.status
  const backendMsg = error.response?.data?.message || error.response?.data?.error

  switch (status) {
    case 400:
      return backendMsg || 'Invalid request inputs. Please review your entries and try again.'
    case 401:
      return backendMsg || 'Your session has expired. Please sign in again.'
    case 403:
      return backendMsg || 'You do not have permission to perform this action.'
    case 404:
      return backendMsg || 'The requested resource could not be found.'
    case 409:
      return backendMsg || 'A conflict occurred with the current request state.'
    case 429:
      return 'Too many requests. Please wait a moment and try again.'
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Our servers encountered an issue while processing your request. Please try again shortly.'
    default:
      return backendMsg || fallbackMessage
  }
}
