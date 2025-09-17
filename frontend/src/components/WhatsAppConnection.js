import React, { useEffect } from 'react';
import { useWhatsApp } from '../contexts/WhatsAppContext';
import { toast } from 'react-toastify';
import { 
  MessageSquare, 
  QrCode, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Smartphone 
} from 'lucide-react';

const WhatsAppConnection = () => {
  const { qrCode, isConnected, status, retryCount, initializeWhatsApp, forceQRGeneration } = useWhatsApp();

  useEffect(() => {
    initializeWhatsApp();
  }, [initializeWhatsApp]);

  const handleReconnect = () => {
    initializeWhatsApp();
    toast.info('Reconnecting to WhatsApp...');
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <CheckCircle size={48} className="status-connected" />,
          title: 'Connected Successfully!',
          message: 'Your WhatsApp is connected and ready to send messages.',
          color: '#25D366'
        };
      case 'qr-generated':
        return {
          icon: <QrCode size={48} style={{ color: '#ffc107' }} />,
          title: 'Scan QR Code',
          message: 'Open WhatsApp on your phone and scan this QR code to connect.',
          color: '#ffc107'
        };
      case 'authenticated':
        return {
          icon: <CheckCircle size={48} className="status-connected" />,
          title: 'Authenticated!',
          message: 'WhatsApp authentication successful. Connecting...',
          color: '#25D366'
        };
      case 'initializing':
        return {
          icon: <RefreshCw size={48} style={{ color: '#007bff', animation: 'spin 1s linear infinite' }} />,
          title: 'Initializing WhatsApp...',
          message: 'Please wait while we prepare the WhatsApp connection.',
          color: '#007bff'
        };
      case 'error':
        return {
          icon: <XCircle size={48} className="status-disconnected" />,
          title: 'Connection Error',
          message: `Failed to connect to WhatsApp. This might be due to network issues or WhatsApp Web being already connected elsewhere. ${retryCount > 0 ? `(Attempt ${retryCount})` : ''} Please try again.`,
          color: '#dc3545'
        };
      default:
        return {
          icon: <XCircle size={48} className="status-disconnected" />,
          title: 'Not Connected',
          message: 'WhatsApp is not connected. Click the button below to start.',
          color: '#6c757d'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div>
      <h1>WhatsApp Connection</h1>
      
      <div className="card">
        <div className="text-center mb-20">
          <div style={{ marginBottom: '20px' }}>
            {statusInfo.icon}
          </div>
          <h2 style={{ color: statusInfo.color, marginBottom: '10px' }}>
            {statusInfo.title}
          </h2>
          <p style={{ color: '#666', fontSize: '16px' }}>
            {statusInfo.message}
          </p>
        </div>

        {qrCode && (
          <div className="text-center mb-20">
            <div style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              display: 'inline-block',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <img 
                src={qrCode} 
                alt="WhatsApp QR Code" 
                style={{ 
                  maxWidth: '300px', 
                  width: '100%',
                  height: 'auto'
                }} 
              />
            </div>
            <div style={{ marginTop: '15px' }}>
              <Smartphone size={20} style={{ marginRight: '8px', color: '#25D366' }} />
              <span style={{ color: '#666' }}>
                Open WhatsApp → Menu → Linked Devices → Link a Device
              </span>
            </div>
          </div>
        )}

        <div className="text-center">
          {!isConnected && status !== 'qr-generated' && status !== 'initializing' && (
            <button 
              onClick={handleReconnect}
              className="btn"
              style={{ marginRight: '10px' }}
            >
              <RefreshCw size={16} style={{ marginRight: '8px' }} />
              {status === 'error' ? 'Retry Connection' : 'Connect WhatsApp'}
            </button>
          )}
          
          {status === 'initializing' && (
            <button 
              className="btn btn-secondary"
              disabled
            >
              <RefreshCw size={16} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
              Initializing...
            </button>
          )}
          
          {status === 'qr-generated' && (
            <button 
              onClick={handleReconnect}
              className="btn btn-secondary"
            >
              <RefreshCw size={16} style={{ marginRight: '8px' }} />
              Generate New QR Code
            </button>
          )}
          
          {status === 'initializing' && (
            <button 
              onClick={forceQRGeneration}
              className="btn btn-secondary"
              style={{ marginLeft: '10px' }}
            >
              <QrCode size={16} style={{ marginRight: '8px' }} />
              Force QR Generation
            </button>
          )}
        </div>
      </div>

      {/* Connection Instructions */}
      <div className="card">
        <h3>How to Connect WhatsApp</h3>
        <div style={{ marginTop: '15px' }}>
          <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '10px' }}>
              <strong>Open WhatsApp on your phone</strong> - Make sure you have WhatsApp installed and logged in
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>Access Linked Devices</strong> - Tap the three dots menu → Linked Devices
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>Scan QR Code</strong> - Tap "Link a Device" and scan the QR code shown above
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>Wait for Connection</strong> - The status will change to "Connected" once successful
            </li>
          </ol>
        </div>
        
        <div style={{ 
          background: '#e7f3ff', 
          padding: '15px', 
          borderRadius: '4px', 
          marginTop: '20px',
          border: '1px solid #b3d9ff'
        }}>
          <strong>Note:</strong> Keep your phone connected to the internet and WhatsApp open for the connection to remain active.
        </div>
        
        <div style={{ 
          background: '#fff3cd', 
          padding: '15px', 
          borderRadius: '4px', 
          marginTop: '20px',
          border: '1px solid #ffeaa7'
        }}>
          <strong>Troubleshooting:</strong>
          <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
            <li>Make sure WhatsApp Web is not already connected on another device</li>
            <li>Check your internet connection</li>
            <li>Try refreshing the page and clicking "Connect WhatsApp" again</li>
            <li>If issues persist, restart the server</li>
          </ul>
        </div>
      </div>

      {/* Connection Status Details */}
      <div className="card">
        <h3>Connection Details</h3>
        <div style={{ marginTop: '15px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid #eee'
          }}>
            <span><strong>Status:</strong></span>
            <span style={{ color: statusInfo.color, fontWeight: 'bold' }}>
              {statusInfo.title}
            </span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid #eee'
          }}>
            <span><strong>Connection:</strong></span>
            <span style={{ color: isConnected ? '#25D366' : '#dc3545', fontWeight: 'bold' }}>
              {isConnected ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '10px 0'
          }}>
            <span><strong>Last Updated:</strong></span>
            <span>{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConnection;
