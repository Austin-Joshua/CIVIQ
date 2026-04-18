'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
});

export const useWebSocket = () => useContext(WebSocketContext);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) {
      if (socket) {
        const timer = setTimeout(() => {
          socket.disconnect();
          setSocket(null);
          setIsConnected(false);
        }, 0);
        return () => clearTimeout(timer);
      }
      return;
    }

    // Go API does not expose Socket.IO by default; set NEXT_PUBLIC_ENABLE_WEBSOCKET=true when you add a WS server.
    if (process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET !== 'true') {
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const API_URL =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      'http://localhost:5001';

    const newSocket = io(API_URL, {
      auth: {
        token,
      },
      query: {
        token,
      },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('[WS] Connected to real-time gateway');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[WS] Disconnected from real-time gateway');
      setIsConnected(false);
    });

    const timer = setTimeout(() => {
      setSocket(newSocket);
    }, 0);

    return () => {
      clearTimeout(timer);
      newSocket.disconnect();
    };
  }, [token]);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}
