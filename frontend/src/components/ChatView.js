import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useWhatsApp } from '../contexts/WhatsAppContext';
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Search,
  CheckCircle,
  User,
  Users,
  RefreshCw
} from 'lucide-react';

const ChatView = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { isConnected } = useWhatsApp();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatDetails = useCallback(async () => {
    try {
      const response = await axios.get(`/api/whatsapp/chats/${chatId}`);
      setChat(response.data.chat);
    } catch (error) {
      console.error('Error fetching chat details:', error);
      toast.error('Failed to fetch chat details');
    }
  }, [chatId]);

  const fetchMessages = useCallback(async () => {
    setLoadingMessages(true);
    try {
      const response = await axios.get(`/api/whatsapp/chats/${chatId}/messages?limit=100`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to fetch messages');
    } finally {
      setLoadingMessages(false);
    }
  }, [chatId]);

  useEffect(() => {
    if (chatId && isConnected) {
      fetchChatDetails();
      fetchMessages();
    }
  }, [chatId, isConnected, fetchChatDetails, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await axios.post(`/api/whatsapp/chats/${chatId}/send`, {
        message: newMessage.trim()
      });

      // Add the sent message to the messages list
      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');
      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getMessageStatus = (message) => {
    if (!message.fromMe) return null;
    
    // Simple status indicator - in real WhatsApp this would be more complex
    return <CheckCircle size={12} color="#25D366" />;
  };

  if (!isConnected) {
    return (
      <div className="card text-center">
        <div style={{ padding: '40px' }}>
          <h3>WhatsApp Not Connected</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Please connect your WhatsApp account first to view this chat.
          </p>
          <button 
            onClick={() => navigate('/whatsapp')}
            className="btn"
          >
            Connect WhatsApp
          </button>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="card text-center">
        <div style={{ padding: '40px' }}>
          <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '15px' }} />
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Chat Header */}
      <div className="bg-whatsapp-green text-white px-4 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/chats')}
            className="bg-transparent border-none text-white cursor-pointer p-1 hover:bg-white/20 rounded transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            {chat.isGroup ? (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Users size={20} />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <User size={20} />
              </div>
            )}
            
            <div className="min-w-0">
              <h3 className="text-base font-semibold m-0 truncate">{chat.name}</h3>
              <p className="text-xs opacity-80 m-0">
                {chat.isGroup ? 'Group' : 'Individual chat'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="bg-transparent border-none text-white cursor-pointer p-2 hover:bg-white/20 rounded transition-colors">
            <Video size={20} />
          </button>
          <button className="bg-transparent border-none text-white cursor-pointer p-2 hover:bg-white/20 rounded transition-colors">
            <Phone size={20} />
          </button>
          <button className="bg-transparent border-none text-white cursor-pointer p-2 hover:bg-white/20 rounded transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-whatsapp-background overflow-y-auto p-3" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
      }}>
        {loadingMessages ? (
          <div className="text-center py-5">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-whatsapp-green" />
            <p className="text-gray-600">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message, index) => {
              const showDate = index === 0 || 
                formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
              
              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="text-center my-2 text-xs text-gray-600 font-semibold">
                      {formatDate(message.timestamp)}
                    </div>
                  )}
                  
                  <div className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'} mb-1`}>
                    <div className={`max-w-[70%] sm:max-w-[60%] rounded-lg px-3 py-2 shadow-sm relative ${
                      message.fromMe 
                        ? 'bg-whatsapp-green-light' 
                        : 'bg-white'
                    }`}>
                      <div className="mb-1 text-sm">
                        {message.body}
                      </div>
                      
                      <div className="flex items-center justify-end gap-1 text-xs text-gray-500">
                        <span>{formatTime(message.timestamp)}</span>
                        {getMessageStatus(message)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center gap-3">
        <button className="bg-transparent border-none cursor-pointer p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
          <Search size={20} />
        </button>
        
        <form onSubmit={sendMessage} className="flex-1 flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green disabled:opacity-50"
            disabled={sending}
          />
          
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`w-10 h-10 rounded-full border-none flex items-center justify-center text-white transition-colors ${
              newMessage.trim() && !sending 
                ? 'bg-whatsapp-green hover:bg-whatsapp-green-dark cursor-pointer' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
