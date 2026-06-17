"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinProduct: (productId: string) => void;
  leaveProduct: (productId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('Connected to Socket.io server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from Socket.io server');
      setIsConnected(false);
    });

    const timer = setTimeout(() => {
      setSocket(socketInstance);
    }, 0);

    return () => {
      clearTimeout(timer);
      socketInstance.disconnect();
    };
  }, []);

  const joinProduct = useCallback((productId: string) => {
    if (socket) {
      socket.emit('join-product', productId);
    }
  }, [socket]);

  const leaveProduct = useCallback((productId: string) => {
    if (socket) {
      socket.emit('leave-product', productId);
    }
  }, [socket]);

  const value: SocketContextType = useMemo(() => ({
    socket,
    isConnected,
    joinProduct,
    leaveProduct,
  }), [socket, isConnected, joinProduct, leaveProduct]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
