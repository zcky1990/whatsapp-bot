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
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected to server');
      // Check WhatsApp status when socket connects
      newSocket.emit('get-whatsapp-status');
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected from server');
    });

    newSocket.on('qr', (qr) => {
      console.log('QR Code received:', qr);
      setQrCode(qr);
      setStatus('qr-generated');
    });

    newSocket.on('whatsapp-ready', (data) => {
      console.log('WhatsApp ready event received:', data);
      setIsConnected(true);
      setStatus('connected');
      setQrCode(null);
    });

    newSocket.on('whatsapp-authenticated', () => {
      console.log('WhatsApp authenticated event received');
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

    newSocket.on('whatsapp-status-response', (statusData) => {
      console.log('WhatsApp status response received:', statusData);
      setIsConnected(statusData.isReady);
      setStatus(statusData.status);
      if (statusData.isReady) {
        setQrCode(null); // Clear QR code if already connected
      }
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const initializeWhatsApp = () => {
    if (socket) {
      console.log('Initializing WhatsApp connection...');
      console.log('Current status before init:', status);
      setStatus('initializing');
      setRetryCount(0);
      socket.emit('init-whatsapp');
      console.log('Emitted init-whatsapp event');
    } else {
      console.error('Socket not connected');
    }
  };

  const checkWhatsAppStatus = () => {
    if (socket) {
      console.log('Checking WhatsApp status...');
      socket.emit('get-whatsapp-status');
    } else {
      console.error('Socket not connected');
    }
  };

  const value = {
    socket,
    qrCode,
    isConnected,
    status,
    retryCount,
    initializeWhatsApp,
    checkWhatsAppStatus
  };

  return (
    <WhatsAppContext.Provider value={value}>
      {children}
    </WhatsAppContext.Provider>
  );
};
