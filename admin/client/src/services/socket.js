import { io } from 'socket.io-client'

const SOCKET_URL =
  import.meta.env.VITE_ADMIN_SOCKET_URL || 'http://localhost:4000'

let socket = null

export const getSocket = (token) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      auth: {
        token: token || sessionStorage.getItem('adminAccessToken') || '',
      },
    })

    socket.on('connect', () => {
      console.log('[Admin Socket] Connected to real-time server with ID:', socket.id)
    })

    socket.on('disconnect', (reason) => {
      console.warn('[Admin Socket] Disconnected from server:', reason)
    })

    socket.on('connect_error', (error) => {
      console.warn('[Admin Socket] Connection error:', error.message)
    })
  }

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
