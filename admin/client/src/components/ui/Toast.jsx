import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ type = 'info', message, title, duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, type, message, title }])

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toastSuccess = useCallback((message, title = 'Success') => {
    addToast({ type: 'success', title, message })
  }, [addToast])

  const toastError = useCallback((message, title = 'Error') => {
    addToast({ type: 'error', title, message })
  }, [addToast])

  const toastInfo = useCallback((message, title = 'Notification') => {
    addToast({ type: 'info', title, message })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toastSuccess, toastError, toastInfo }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const typeMap = {
            success: {
              icon: CheckCircle2,
              bg: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300',
              iconColor: 'text-emerald-400',
            },
            error: {
              icon: AlertCircle,
              bg: 'bg-rose-950/90 border-rose-500/40 text-rose-300',
              iconColor: 'text-rose-400',
            },
            info: {
              icon: Info,
              bg: 'bg-slate-900/95 border-slate-700 text-slate-200',
              iconColor: 'text-blue-400',
            },
          }

          const style = typeMap[toast.type] || typeMap.info
          const Icon = style.icon

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl shadow-black/80 transition-all ${style.bg}`}
            >
              <Icon size={20} className={`${style.iconColor} shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h5 className="font-bold text-sm text-white">{toast.title}</h5>
                )}
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export default ToastContext
