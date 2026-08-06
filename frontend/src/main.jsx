import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// App already wraps AuthContextProvider and AIContextProvider internally
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
