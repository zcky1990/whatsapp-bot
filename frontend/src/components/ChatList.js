import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useWhatsApp } from '../contexts/WhatsAppContext';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Users, 
  User,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

const ChatList = () => {
  const navigate = useNavigate();
  const { isConnected } = useWhatsApp();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [newChatNumber, setNewChatNumber] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    if (isConnected) {
      fetchChats();
    }
  }, [isConnected]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/whatsapp/chats');
      setChats(response.data.chats || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = async (e) => {
    e.preventDefault();
    if (!newChatNumber.trim()) {
      toast.error('Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/whatsapp/start-chat', {
        phoneNumber: newChatNumber
      });
      
      toast.success('Chat started successfully!');
      setNewChatNumber('');
      setShowNewChatForm(false);
      fetchChats(); // Refresh the chat list
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error(error.response?.data?.error || 'Failed to start chat');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatMessage = (message) => {
    if (!message) return 'No messages';
    if (message.body.length > 50) {
      return message.body.substring(0, 50) + '...';
    }
    return message.body;
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isConnected) {
    return (
      <div className="card text-center">
        <XCircle size={48} className="status-disconnected" style={{ marginBottom: '20px' }} />
        <h3>WhatsApp Not Connected</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Please connect your WhatsApp account first to view chats.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>WhatsApp Chats</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={fetchChats}
            className="btn btn-secondary"
            disabled={loading}
          >
            <RefreshCw size={16} style={{ marginRight: '8px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button 
            onClick={() => setShowNewChatForm(true)}
            className="btn"
          >
            <Plus size={16} style={{ marginRight: '8px' }} />
            New Chat
          </button>
        </div>
      </div>

      {/* New Chat Form */}
      {showNewChatForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Start New Chat</h3>
            <button 
              onClick={() => setShowNewChatForm(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
          
          <form onSubmit={startNewChat}>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                value={newChatNumber}
                onChange={(e) => setNewChatNumber(e.target.value)}
                placeholder="Enter phone number (e.g., +1234567890)"
                required
              />
              <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                Include country code (e.g., +1 for US, +62 for Indonesia)
              </small>
            </div>
            
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Starting Chat...' : 'Start Chat'}
            </button>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px 12px 12px 40px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="card">
        {loading && chats.length === 0 ? (
          <div className="text-center" style={{ padding: '40px' }}>
            <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '15px' }} />
            <p>Loading chats...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center" style={{ padding: '40px' }}>
            <MessageSquare size={48} color="#ccc" style={{ marginBottom: '15px' }} />
            <h3>No Chats Found</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              {searchTerm ? 'No chats match your search.' : 'You don\'t have any chats yet.'}
            </p>
            {!searchTerm && (
              <button 
                onClick={() => setShowNewChatForm(true)}
                className="btn"
              >
                <Plus size={16} style={{ marginRight: '8px' }} />
                Start Your First Chat
              </button>
            )}
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '15px', color: '#666' }}>
              {filteredChats.length} chat{filteredChats.length !== 1 ? 's' : ''} found
            </div>
            
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-item ${selectedChat?.id === chat.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedChat(chat);
                    navigate(`/chats/${chat.id}`);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '15px',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    backgroundColor: selectedChat?.id === chat.id ? '#f0f8ff' : 'transparent'
                  }}
                >
                  <div style={{ marginRight: '15px' }}>
                    {chat.isGroup ? (
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: '#25D366',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <Users size={24} />
                      </div>
                    ) : (
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: '#25D366',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <User size={24} />
                      </div>
                    )}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                        {chat.name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {chat.lastMessage && (
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            {formatTime(chat.lastMessage.timestamp)}
                          </span>
                        )}
                        {chat.unreadCount > 0 && (
                          <span style={{
                            backgroundColor: '#25D366',
                            color: 'white',
                            borderRadius: '10px',
                            padding: '2px 6px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {chat.lastMessage && (
                        <>
                          {chat.lastMessage.fromMe ? (
                            <CheckCircle size={12} color="#25D366" />
                          ) : (
                            <Clock size={12} color="#666" />
                          )}
                          <p style={{ 
                            margin: 0, 
                            fontSize: '14px', 
                            color: '#666',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {formatMessage(chat.lastMessage)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Chat Details */}
      {selectedChat && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Chat Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <strong>Name:</strong> {selectedChat.name}
            </div>
            <div>
              <strong>Type:</strong> {selectedChat.isGroup ? 'Group' : 'Individual'}
            </div>
            <div>
              <strong>Unread Messages:</strong> {selectedChat.unreadCount || 0}
            </div>
            <div>
              <strong>Last Activity:</strong> {formatTime(selectedChat.timestamp)}
            </div>
          </div>
          
          {selectedChat.lastMessage && (
            <div style={{ marginTop: '15px' }}>
              <strong>Last Message:</strong>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '10px', 
                borderRadius: '4px', 
                marginTop: '5px',
                fontStyle: 'italic'
              }}>
                {selectedChat.lastMessage.body}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatList;
