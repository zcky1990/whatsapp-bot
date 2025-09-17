import React, { useState, useEffect, useRef } from 'react';
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
  Clock,
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
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chatId && isConnected) {
      fetchChatDetails();
      fetchMessages();
    }
  }, [chatId, isConnected]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatDetails = async () => {
    try {
      const response = await axios.get(`/api/whatsapp/chats/${chatId}`);
      setChat(response.data.chat);
    } catch (error) {
      console.error('Error fetching chat details:', error);
      toast.error('Failed to fetch chat details');
    }
  };

  const fetchMessages = async () => {
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
  };

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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <div style={{
        background: '#25D366',
        color: 'white',
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={() => navigate('/chats')}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {chat.isGroup ? (
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users size={20} />
              </div>
            ) : (
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={20} />
              </div>
            )}
            
            <div>
              <h3 style={{ margin: 0, fontSize: '16px' }}>{chat.name}</h3>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>
                {chat.isGroup ? 'Group' : 'Individual chat'}
              </p>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '5px'
          }}>
            <Video size={20} />
          </button>
          <button style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '5px'
          }}>
            <Phone size={20} />
          </button>
          <button style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '5px'
          }}>
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        background: '#e5ddd5',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        overflowY: 'auto',
        padding: '10px'
      }}>
        {loadingMessages ? (
          <div className="text-center" style={{ padding: '20px' }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '10px' }} />
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center" style={{ padding: '40px' }}>
            <p style={{ color: '#666' }}>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div>
            {messages.map((message, index) => {
              const showDate = index === 0 || 
                formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
              
              return (
                <div key={message.id}>
                  {showDate && (
                    <div style={{
                      textAlign: 'center',
                      margin: '10px 0',
                      fontSize: '12px',
                      color: '#666',
                      fontWeight: 'bold'
                    }}>
                      {formatDate(message.timestamp)}
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: message.fromMe ? 'flex-end' : 'flex-start',
                    marginBottom: '5px'
                  }}>
                    <div style={{
                      maxWidth: '70%',
                      background: message.fromMe ? '#dcf8c6' : 'white',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      position: 'relative'
                    }}>
                      <div style={{ marginBottom: '5px' }}>
                        {message.body}
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '5px',
                        fontSize: '11px',
                        color: '#666'
                      }}>
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
      <div style={{
        background: 'white',
        padding: '10px 15px',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <button style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          color: '#666'
        }}>
          <Search size={20} />
        </button>
        
        <form onSubmit={sendMessage} style={{ flex: 1, display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '10px 15px',
              border: '1px solid #e0e0e0',
              borderRadius: '20px',
              outline: 'none',
              fontSize: '14px'
            }}
            disabled={sending}
          />
          
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            style={{
              background: newMessage.trim() && !sending ? '#25D366' : '#ccc',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed',
              color: 'white'
            }}
          >
            {sending ? (
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
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
