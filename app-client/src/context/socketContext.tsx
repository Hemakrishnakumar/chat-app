import { createContext, useContext, useEffect, useState, type ReactElement } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

const BACKEND_SOCKET_URL = `${import.meta.env.VITE_API_BASE_URL as string || 'http://localhost:3000'}/chat`

export const SocketProvider = ({ children }: { children: ReactElement}) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if(socket) return;
    const newSocket = io(BACKEND_SOCKET_URL, {
      withCredentials: true
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};