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
  QrCode,
  Users,
  Zap
} from 'lucide-react';

const Dashboard = () => {
  const { isConnected, status } = useWhatsApp();

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle size={20} className="text-whatsapp-green" />;
      case 'qr-generated':
        return <QrCode size={20} className="text-yellow-500" />;
      case 'error':
        return <XCircle size={20} className="text-red-600" />;
      default:
        return <XCircle size={20} className="text-gray-500" />;
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

  const getStatusColorClass = () => {
    switch (status) {
      case 'connected':
        return 'text-whatsapp-green';
      case 'qr-generated':
        return 'text-yellow-500';
      case 'authenticated':
        return 'text-whatsapp-green';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* WhatsApp Status Card */}
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <MessageSquare size={24} className="text-whatsapp-green mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">WhatsApp Connection</h3>
          </div>
          
          <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
            {getStatusIcon()}
            <span className={`ml-3 font-semibold ${getStatusColorClass()}`}>
              {getStatusText()}
            </span>
          </div>
          
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            {status === 'connected' 
              ? 'Your WhatsApp is connected and ready to send messages.'
              : status === 'qr-generated'
              ? 'Scan the QR code in the WhatsApp section to connect.'
              : 'Connect your WhatsApp account to start sending messages.'
            }
          </p>
          
          <Link to="/whatsapp" className="btn w-full flex items-center justify-center">
            <MessageSquare size={16} className="mr-2" />
            Manage WhatsApp
          </Link>
        </div>

        {/* Templates Card */}
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <Send size={24} className="text-whatsapp-green mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">Message Templates</h3>
          </div>
          
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            Create and manage message templates for automated responses and campaigns.
          </p>
          
          <Link to="/templates" className="btn w-full flex items-center justify-center">
            <Send size={16} className="mr-2" />
            Manage Templates
          </Link>
        </div>

        {/* AI Configuration Card */}
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <Bot size={24} className="text-whatsapp-green mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">AI Agent Configuration</h3>
          </div>
          
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            Configure AI agents to integrate with external services and APIs.
          </p>
          
          <Link to="/ai-config" className="btn w-full flex items-center justify-center">
            <Bot size={16} className="mr-2" />
            Configure AI
          </Link>
        </div>

        {/* Send Message Card */}
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <Settings size={24} className="text-whatsapp-green mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">Send Messages</h3>
          </div>
          
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            Send individual messages or use templates to communicate with contacts.
          </p>
          
          <Link to="/send-message" className="btn w-full flex items-center justify-center">
            <Settings size={16} className="mr-2" />
            Send Messages
          </Link>
        </div>

        {/* Chats Card */}
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <Users size={24} className="text-whatsapp-green mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">Chat Management</h3>
          </div>
          
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            View all your WhatsApp chats and manage conversations with contacts.
          </p>
          
          <Link to="/chats" className="btn w-full flex items-center justify-center">
            <Users size={16} className="mr-2" />
            View Chats
          </Link>
        </div>

        {/* Rules Card */}
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <Zap size={24} className="text-whatsapp-green mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">Automation Rules</h3>
          </div>
          
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            Create automated responses and actions based on incoming message conditions.
          </p>
          
          <Link to="/rules" className="btn w-full flex items-center justify-center">
            <Zap size={16} className="mr-2" />
            Manage Rules
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-whatsapp-green mb-2">
              {isConnected ? '✓' : '✗'}
            </div>
            <div className="text-sm text-gray-600">WhatsApp Status</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-whatsapp-green mb-2">
              ∞
            </div>
            <div className="text-sm text-gray-600">Templates Available</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-whatsapp-green mb-2">
              ∞
            </div>
            <div className="text-sm text-gray-600">AI Configurations</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-whatsapp-green mb-2">
              💬
            </div>
            <div className="text-sm text-gray-600">Active Chats</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
