"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
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

  const joinProduct = (productId: string) => {
    if (socket) {
      socket.emit('join-product', productId);
    }
  };

  const leaveProduct = (productId: string) => {
    if (socket) {
      socket.emit('leave-product', productId);
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    joinProduct,
    leaveProduct,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
