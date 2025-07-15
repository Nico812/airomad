import React, { createContext, useContext, useMemo } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const socket = useMemo(() => io('http://localhost:5500'), []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}