/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// ─── Auth pages (existing, kept intact) ───
import Register from './features/auth/pages/Register'
import Login from './features/auth/pages/Login'
import AuthShell from './features/auth/pages/Authshell'
import SecureRoute from './features/auth/components/SecureRoute'
import ErrorPage from './features/auth/pages/Error.page'

// ─── AI pages (lazy loaded) ───
const Landing = lazy(() => import('./features/ai/pages/Landing'))
const Analyze = lazy(() => import('./features/ai/pages/Analyze'))
const ResumeResult = lazy(() => import('./features/ai/pages/ResumeResult'))
const InterviewReport = lazy(() => import('./features/ai/pages/InterviewReport'))
const Profile = lazy(() => import('./features/auth/pages/Profile'))
const MatchedJobs = lazy(() => import('./features/ai/pages/MatchedJobs'))

// ─── Static/info pages (lazy loaded, in components/ui) ───
const AboutUs = lazy(() => import(('./components/layout/Aboutus')))
const FAQ = lazy(() => import('./features/ai/pages/FAQ'))
const Contact = lazy(() => import('./features/ai/pages/Contact'))
const PrivacyPolicy = lazy(() => import('./features/ai/pages/PrivacyPolicy'))
const Terms = lazy(() => import('./features/ai/pages/Terms'))
const CookiePolicy = lazy(() => import('./features/ai/pages/CookiePolicy'))
// ─── Loading fallback ───
const PageLoader = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-bg)',
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
        animation: 'pulse-loader 1s ease-in-out infinite',
        boxShadow: '0 4px 18px rgba(245, 158, 11, 0.35)',
      }} />
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Loading...</p>
    </div>
    <style>{`
      @keyframes pulse-loader {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(0.85); opacity: 0.6; }
      }
    `}</style>
  </div>
)

export const Router = createBrowserRouter([
  // ─── AI / Public routes ───
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Landing />
      </Suspense>
    ),
  },
  {
    path: '/analyze',
    element: (
      <SecureRoute>
        <Suspense fallback={<PageLoader />}>
          <Analyze />
        </Suspense>
      </SecureRoute>
    ),
  },
  {
    path: '/resume-result',
    element: (
      <SecureRoute>
        <Suspense fallback={<PageLoader />}>
          <ResumeResult />
        </Suspense>
      </SecureRoute>
    ),
  },
  {
    path: '/interview-report',
    element: (
      <SecureRoute>
        <Suspense fallback={<PageLoader />}>
          <InterviewReport />
        </Suspense>
      </SecureRoute>
    ),
  },
  {
    path: '/match-jobs',
    element: (
      <SecureRoute>
        <Suspense fallback={<PageLoader />}>
          <MatchedJobs />
        </Suspense>
      </SecureRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <SecureRoute>
        <Suspense fallback={<PageLoader />}>
          <Profile />
        </Suspense>
      </SecureRoute>
    ),
  },

  // ─── Static / info routes (public, footer links) ───
  {
    path: '/about',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AboutUs />
      </Suspense>
    ),
  },
  {
    path: '/faq',
    element: (
      <Suspense fallback={<PageLoader />}>
        <FAQ />
      </Suspense>
    ),
  },
  {
    path: '/contact',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Contact />
      </Suspense>
    ),
  },
  {
    path: '/privacy',
    element: (
      <Suspense fallback={<PageLoader />}>
        <PrivacyPolicy />
      </Suspense>
    ),
  },
  {
    path: '/terms',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Terms />
      </Suspense>
    ),
  },
  {
    path: '/cookie-policy',
    element: (
      <Suspense fallback={<PageLoader />}>
        <CookiePolicy />
      </Suspense>
    ),
  },

  // ─── Auth routes (shared layout for smooth Login <-> Register transition) ───
  {
    element: <AuthShell />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },

  // ─── 404 ───
  {
    path: '*',
    element: <ErrorPage />,
  },
])
