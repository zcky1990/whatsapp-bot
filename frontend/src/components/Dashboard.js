import React from 'react';
import { Link } from 'react-router-dom';
import { useWhatsApp } from '../contexts/WhatsAppContext';
import { 
  MessageSquare, 
  Settings, 
  Send, 
  Bot, 
  CheckCircle, 
  XCircle,
  QrCode 
} from 'lucide-react';

const Dashboard = () => {
  const { isConnected, status } = useWhatsApp();

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle size={20} className="status-connected" />;
      case 'qr-generated':
        return <QrCode size={20} style={{ color: '#ffc107' }} />;
      case 'error':
        return <XCircle size={20} className="status-disconnected" />;
      default:
        return <XCircle size={20} className="status-disconnected" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'qr-generated':
        return 'QR Code Generated';
      case 'authenticated':
        return 'Authenticated';
      case 'error':
        return 'Connection Error';
      default:
        return 'Disconnected';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return '#25D366';
      case 'qr-generated':
        return '#ffc107';
      case 'authenticated':
        return '#25D366';
      case 'error':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      
      <div className="grid">
        {/* WhatsApp Status Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <MessageSquare size={24} color="#25D366" style={{ marginRight: '10px' }} />
            <h3>WhatsApp Connection</h3>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '15px',
            padding: '10px',
            background: '#f8f9fa',
            borderRadius: '4px'
          }}>
            {getStatusIcon()}
            <span style={{ 
              marginLeft: '10px', 
              fontWeight: 'bold',
              color: getStatusColor()
            }}>
              {getStatusText()}
            </span>
          </div>
          
          <p style={{ color: '#666', marginBottom: '15px' }}>
            {status === 'connected' 
              ? 'Your WhatsApp is connected and ready to send messages.'
              : status === 'qr-generated'
              ? 'Scan the QR code in the WhatsApp section to connect.'
              : 'Connect your WhatsApp account to start sending messages.'
            }
          </p>
          
          <Link to="/whatsapp" className="btn">
            <MessageSquare size={16} style={{ marginRight: '8px' }} />
            Manage WhatsApp
          </Link>
        </div>

        {/* Templates Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <Send size={24} color="#25D366" style={{ marginRight: '10px' }} />
            <h3>Message Templates</h3>
          </div>
          
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Create and manage message templates for automated responses and campaigns.
          </p>
          
          <Link to="/templates" className="btn">
            <Send size={16} style={{ marginRight: '8px' }} />
            Manage Templates
          </Link>
        </div>

        {/* AI Configuration Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <Bot size={24} color="#25D366" style={{ marginRight: '10px' }} />
            <h3>AI Agent Configuration</h3>
          </div>
          
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Configure AI agents to integrate with external services and APIs.
          </p>
          
          <Link to="/ai-config" className="btn">
            <Bot size={16} style={{ marginRight: '8px' }} />
            Configure AI
          </Link>
        </div>

        {/* Send Message Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
            <Settings size={24} color="#25D366" style={{ marginRight: '10px' }} />
            <h3>Send Messages</h3>
          </div>
          
          <p style={{ color: '#666', marginBottom: '15px' }}>
            Send individual messages or use templates to communicate with contacts.
          </p>
          
          <Link to="/send-message" className="btn">
            <Settings size={16} style={{ marginRight: '8px' }} />
            Send Messages
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card mt-20">
        <h3>Quick Overview</h3>
        <div className="grid" style={{ marginTop: '15px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#25D366' }}>
              {isConnected ? '✓' : '✗'}
            </div>
            <div style={{ color: '#666' }}>WhatsApp Status</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#25D366' }}>
              ∞
            </div>
            <div style={{ color: '#666' }}>Templates Available</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#25D366' }}>
              ∞
            </div>
            <div style={{ color: '#666' }}>AI Configurations</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
