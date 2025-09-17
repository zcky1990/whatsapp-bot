import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, MessageSquare, Settings, Send, Bot } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{ 
      background: '#25D366', 
      color: 'white', 
      padding: '1rem 0',
      marginBottom: '20px'
    }}>
      <div className="container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MessageSquare size={24} />
          <h1 style={{ margin: 0 }}>WhatsApp Bot Manager</h1>
        </div>
        
        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link 
            to="/" 
            style={{ 
              color: 'white', 
              textDecoration: 'none',
              opacity: isActive('/') ? 1 : 0.7,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Settings size={16} />
            Dashboard
          </Link>
          
          <Link 
            to="/whatsapp" 
            style={{ 
              color: 'white', 
              textDecoration: 'none',
              opacity: isActive('/whatsapp') ? 1 : 0.7,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <MessageSquare size={16} />
            WhatsApp
          </Link>
          
          <Link 
            to="/templates" 
            style={{ 
              color: 'white', 
              textDecoration: 'none',
              opacity: isActive('/templates') ? 1 : 0.7,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Send size={16} />
            Templates
          </Link>
          
          <Link 
            to="/ai-config" 
            style={{ 
              color: 'white', 
              textDecoration: 'none',
              opacity: isActive('/ai-config') ? 1 : 0.7,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Bot size={16} />
            AI Config
          </Link>
          
          <Link 
            to="/send-message" 
            style={{ 
              color: 'white', 
              textDecoration: 'none',
              opacity: isActive('/send-message') ? 1 : 0.7,
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Send size={16} />
            Send Message
          </Link>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            marginLeft: '20px',
            paddingLeft: '20px',
            borderLeft: '1px solid rgba(255,255,255,0.3)'
          }}>
            <span>Welcome, {user?.username}</span>
            <button 
              onClick={logout}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
