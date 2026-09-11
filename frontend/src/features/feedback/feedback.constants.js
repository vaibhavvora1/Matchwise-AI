export const FEEDBACK_TYPES = [
  { value: 'general', label: 'General Feedback' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'ui_ux', label: 'UI/UX Feedback' },
  { value: 'job_matching', label: 'Job Matching Feedback' },
  { value: 'resume', label: 'Resume Feedback' },
  { value: 'interview', label: 'Interview Feedback' },
  { value: 'other', label: 'Other' },
]

export const FEEDBACK_STATUSES = ['pending', 'approved', 'rejected']

export const FEEDBACK_MESSAGE_MIN = 10
export const FEEDBACK_MESSAGE_MAX = 2000

export const formatFeedbackDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

