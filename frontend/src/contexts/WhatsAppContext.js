import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const WhatsAppContext = createContext();

export const useWhatsApp = () => {
  const context = useContext(WhatsAppContext);
  if (!context) {
    throw new Error('useWhatsApp must be used within a WhatsAppProvider');
  }
  return context;
};

export const WhatsAppProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('disconnected');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('qr', (qr) => {
      setQrCode(qr);
      setStatus('qr-generated');
    });

    newSocket.on('whatsapp-ready', (data) => {
      setIsConnected(true);
      setStatus('connected');
      setQrCode(null);
    });

    newSocket.on('whatsapp-authenticated', () => {
      setStatus('authenticated');
    });

    newSocket.on('whatsapp-error', (error) => {
      setStatus('error');
      console.error('WhatsApp error:', error);
      setQrCode(null);
      setRetryCount(prev => prev + 1);
    });

    newSocket.on('whatsapp-disconnected', (data) => {
      setIsConnected(false);
      setStatus('disconnected');
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const initializeWhatsApp = () => {
    if (socket) {
      console.log('Initializing WhatsApp connection...');
      setStatus('initializing');
      setRetryCount(0);
      socket.emit('init-whatsapp');
    } else {
      console.error('Socket not connected');
    }
  };

  const forceQRGeneration = () => {
    if (socket) {
      console.log('Forcing QR generation...');
      socket.emit('force-qr');
    }
  };

  const value = {
    socket,
    qrCode,
    isConnected,
    status,
    retryCount,
    initializeWhatsApp,
    forceQRGeneration
  };

  return (
    <WhatsAppContext.Provider value={value}>
      {children}
    </WhatsAppContext.Provider>
  );
};
