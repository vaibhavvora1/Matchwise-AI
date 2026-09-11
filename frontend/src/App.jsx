import { MotionConfig } from 'framer-motion'
import { RouterProvider } from 'react-router-dom'
import { Router } from './app.routes.jsx'
import { AuthContextProvider } from './features/auth/auth.context.jsx'
import { AIContextProvider } from './context/AIContext.jsx'
import SmoothScrollProvider from './components/layout/SmoothScrollProvider.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'
import ErrorBoundary from './components/ui/ErrorBoundary.jsx'

const App = () => {
  return (
    <ErrorBoundary>
      <AuthContextProvider>
        <AIContextProvider>
          <ToastProvider>
            <SmoothScrollProvider>
              <MotionConfig reducedMotion="user">
                <RouterProvider router={Router} />
              </MotionConfig>
            </SmoothScrollProvider>
          </ToastProvider>
        </AIContextProvider>
      </AuthContextProvider>
    </ErrorBoundary>
  )
}

export default App
