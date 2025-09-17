import React, { useState, useEffect } from 'react';
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
import Header from './components/Header';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WhatsAppProvider } from './contexts/WhatsAppContext';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container">
        <div className="text-center">
          <h2>Loading...</h2>
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
