import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, MessageSquare, Settings, Send, Bot, Users, Zap } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-whatsapp-green text-white py-4 mb-5">
      <div className="container">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-2.5">
            <MessageSquare size={24} />
            <h1 className="text-lg sm:text-xl font-bold m-0">WhatsApp Bot Manager</h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Link 
              to="/" 
              className={`text-white no-underline flex items-center gap-1 px-2 py-1 rounded transition-opacity ${
                isActive('/') ? 'opacity-100 bg-white/20' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Settings size={16} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            
            <Link 
              to="/whatsapp" 
              className={`text-white no-underline flex items-center gap-1 px-2 py-1 rounded transition-opacity ${
                isActive('/whatsapp') ? 'opacity-100 bg-white/20' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <MessageSquare size={16} />
              <span className="hidden sm:inline">WhatsApp</span>
            </Link>
            
            <Link 
              to="/chats" 
              className={`text-white no-underline flex items-center gap-1 px-2 py-1 rounded transition-opacity ${
                isActive('/chats') ? 'opacity-100 bg-white/20' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Users size={16} />
              <span className="hidden sm:inline">Chats</span>
            </Link>
            
            <Link 
              to="/templates" 
              className={`text-white no-underline flex items-center gap-1 px-2 py-1 rounded transition-opacity ${
                isActive('/templates') ? 'opacity-100 bg-white/20' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Send size={16} />
              <span className="hidden sm:inline">Templates</span>
            </Link>
            
            <Link 
              to="/ai-config" 
              className={`text-white no-underline flex items-center gap-1 px-2 py-1 rounded transition-opacity ${
                isActive('/ai-config') ? 'opacity-100 bg-white/20' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Bot size={16} />
              <span className="hidden sm:inline">AI Config</span>
            </Link>
            
            <Link 
              to="/send-message" 
              className={`text-white no-underline flex items-center gap-1 px-2 py-1 rounded transition-opacity ${
                isActive('/send-message') ? 'opacity-100 bg-white/20' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Send size={16} />
              <span className="hidden sm:inline">Send Message</span>
            </Link>
            
            <Link 
              to="/rules" 
              className={`text-white no-underline flex items-center gap-1 px-2 py-1 rounded transition-opacity ${
                isActive('/rules') ? 'opacity-100 bg-white/20' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Zap size={16} />
              <span className="hidden sm:inline">Rules</span>
            </Link>
            
            {/* User Info and Logout */}
            <div className="flex items-center gap-2.5 ml-4 pl-4 border-l border-white/30">
              <span className="text-sm hidden sm:inline">Welcome, {user?.username}</span>
              <button 
                onClick={logout}
                className="bg-white/20 border-none text-white px-2.5 py-1.5 rounded cursor-pointer flex items-center gap-1 text-sm hover:bg-white/30 transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
