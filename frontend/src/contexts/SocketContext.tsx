import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketContextType {
  socket: Socket | null
  connected: boolean
  joinAgentRoom: (agentId: string) => void
  leaveAgentRoom: (agentId: string) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    })

    newSocket.on('connect', () => {
      setConnected(true)
      console.log('Connected to server')
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
      console.log('Disconnected from server')
    })

    newSocket.on('connection_established', (data) => {
      console.log('Connection established:', data)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const joinAgentRoom = (agentId: string) => {
    if (socket) {
      socket.emit('join_agent_room', { agent_id: agentId })
    }
  }

  const leaveAgentRoom = (agentId: string) => {
    if (socket) {
      socket.emit('leave_agent_room', { agent_id: agentId })
    }
  }

  const value = {
    socket,
    connected,
    joinAgentRoom,
    leaveAgentRoom,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}