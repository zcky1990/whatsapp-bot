import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import WhatsAppConnection from './components/WhatsAppConnection';
import TemplateManager from './components/TemplateManager';
import AIConfig from './components/AIConfig';
import MessageSender from './components/MessageSender';
import ChatList from './components/ChatList';
import ChatView from './components/ChatView';
import RulesManager from './components/RulesManager';
import Header from './components/Header';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WhatsAppProvider } from './contexts/WhatsAppContext';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whatsapp-green mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Checking Session...</h2>
          <p className="text-gray-600">Please wait while we verify your login status</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        <ToastContainer />
      </Router>
    );
  }

  return (
    <WhatsAppProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/chats/:chatId" element={<ChatView />} />
            <Route path="*" element={
              <div className="container">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/whatsapp" element={<WhatsAppConnection />} />
                  <Route path="/chats" element={<ChatList />} />
                  <Route path="/templates" element={<TemplateManager />} />
                  <Route path="/ai-config" element={<AIConfig />} />
                  <Route path="/send-message" element={<MessageSender />} />
                  <Route path="/rules" element={<RulesManager />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
            } />
          </Routes>
          <ToastContainer />
        </div>
      </Router>
    </WhatsAppProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
