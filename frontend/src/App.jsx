import { MotionConfig } from 'framer-motion'
import { RouterProvider } from 'react-router-dom'
import { Router } from './app.routes.jsx'
import { AuthContextProvider } from './features/auth/auth.context.jsx'
import { AIContextProvider } from './context/AIContext.jsx'
import SmoothScrollProvider from './components/layout/SmoothScrollProvider.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'

const App = () => {
  return (
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
  )
}

export default App
