import { createContext, useContext, useEffect, useState } from 'react'
import { getSocket } from '../services/socket'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState(null)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsConnected(false)
      return
    }

    const socket = getSocket(token)

    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)

    const onFeedbackStatusUpdated = (data) => {
      setLastEvent({ type: 'FEEDBACK_STATUS_UPDATED', data, timestamp: Date.now() })
    }

    const onFeedbackDeleted = (data) => {
      setLastEvent({ type: 'FEEDBACK_DELETED', data, timestamp: Date.now() })
    }

    const onFeedbackCreated = (data) => {
      setLastEvent({ type: 'FEEDBACK_CREATED', data, timestamp: Date.now() })
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('FEEDBACK_STATUS_UPDATED', onFeedbackStatusUpdated)
    socket.on('FEEDBACK_DELETED', onFeedbackDeleted)
    socket.on('FEEDBACK_CREATED', onFeedbackCreated)

    if (socket.connected) {
      setIsConnected(true)
    }

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('FEEDBACK_STATUS_UPDATED', onFeedbackStatusUpdated)
      socket.off('FEEDBACK_DELETED', onFeedbackDeleted)
      socket.off('FEEDBACK_CREATED', onFeedbackCreated)
    }
  }, [token, isAuthenticated])

  return (
    <SocketContext.Provider value={{ isConnected, lastEvent }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  return useContext(SocketContext)
}

export default SocketContext
