import api from './httpClient'

let lastTrackedEventKey = ''
let lastTrackedTimestamp = 0

/**
 * Tracks a meaningful client-side user action (e.g. PAGE_VIEWED, MATCH_VIEWED).
 * Operates strictly asynchronously and fails silently if user is not authenticated or server is offline.
 *
 * @param {Object} params
 * @param {string} params.eventType - Valid activity event type (e.g. PAGE_VIEWED, MATCH_VIEWED)
 * @param {string} params.description - Human readable summary of the event
 * @param {Object} [params.metadata] - Safe metadata object (e.g. page path, job ID)
 */
export async function trackActivity({ eventType, description, metadata = {} }) {
  if (!eventType || !description) return

  // Prevent spamming the exact same event within 5 seconds
  const currentKey = `${eventType}:${description}`
  const now = Date.now()
  if (currentKey === lastTrackedEventKey && now - lastTrackedTimestamp < 5000) {
    return
  }

  lastTrackedEventKey = currentKey
  lastTrackedTimestamp = now

  try {
    // Only send if Authorization header is set (user is logged in)
    if (!api.defaults.headers.common.Authorization) {
      return
    }

    await api.post('/user/activity', {
      eventType,
      description,
      metadata,
    })
  } catch (err) {
    // Fail silently on client telemetry
    if (import.meta.env.DEV) {
      console.debug('[Activity Tracker] Non-fatal client telemetry notice:', err.message)
    }
  }
}

export default trackActivity
