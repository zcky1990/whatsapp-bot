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
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-5">
        <h1 className="text-2xl font-bold text-gray-800">WhatsApp Chats</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button 
            onClick={fetchChats}
            className="btn btn-secondary flex items-center justify-center"
            disabled={loading}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button 
            onClick={() => setShowNewChatForm(true)}
            className="btn flex items-center justify-center"
          >
            <Plus size={16} className="mr-2" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      {/* New Chat Form */}
      {showNewChatForm && (
        <div className="card">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-gray-800">Start New Chat</h3>
            <button 
              onClick={() => setShowNewChatForm(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
          
          <form onSubmit={startNewChat} className="space-y-4">
            <div className="form-group">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={newChatNumber}
                onChange={(e) => setNewChatNumber(e.target.value)}
                placeholder="Enter phone number (e.g., +1234567890)"
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
                required
              />
              <small className="text-gray-500 text-xs mt-1 block">
                Include country code (e.g., +1 for US, +62 for Indonesia)
              </small>
            </div>
            
            <button 
              type="submit" 
              className="btn w-full sm:w-auto" 
              disabled={loading}
            >
              {loading ? 'Starting Chat...' : 'Start Chat'}
            </button>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="card">
        {loading && chats.length === 0 ? (
          <div className="text-center py-10">
            <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-whatsapp-green" />
            <p className="text-gray-600">Loading chats...</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-10">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Chats Found</h3>
            <p className="text-gray-600 mb-5">
              {searchTerm ? 'No chats match your search.' : 'You don\'t have any chats yet.'}
            </p>
            {!searchTerm && (
              <button 
                onClick={() => setShowNewChatForm(true)}
                className="btn flex items-center mx-auto"
              >
                <Plus size={16} className="mr-2" />
                Start Your First Chat
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-4 text-sm text-gray-600">
              {filteredChats.length} chat{filteredChats.length !== 1 ? 's' : ''} found
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-1">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-item flex items-center p-4 border-b border-gray-100 cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
                    selectedChat?.id === chat.id ? 'bg-blue-50 border-l-4 border-whatsapp-green' : ''
                  }`}
                  onClick={() => {
                    setSelectedChat(chat);
                    navigate(`/chats/${chat.id}`);
                  }}
                >
                  <div className="mr-4 flex-shrink-0">
                    {chat.isGroup ? (
                      <div className="w-12 h-12 rounded-full bg-whatsapp-green flex items-center justify-center text-white">
                        <Users size={24} />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-whatsapp-green flex items-center justify-center text-white">
                        <User size={24} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-base font-semibold text-gray-800 truncate">
                        {chat.name}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {chat.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTime(chat.lastMessage.timestamp)}
                          </span>
                        )}
                        {chat.unreadCount > 0 && (
                          <span className="bg-whatsapp-green text-white rounded-full px-2 py-1 text-xs font-bold min-w-[20px] text-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {chat.lastMessage && (
                        <>
                          {chat.lastMessage.fromMe ? (
                            <CheckCircle size={12} className="text-whatsapp-green flex-shrink-0" />
                          ) : (
                            <Clock size={12} className="text-gray-400 flex-shrink-0" />
                          )}
                          <p className="text-sm text-gray-600 truncate m-0">
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
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Chat Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <span className="font-medium text-gray-700">Name:</span>
              <span className="text-gray-900">{selectedChat.name}</span>
            </div>
            <div className="space-y-1">
              <span className="font-medium text-gray-700">Type:</span>
              <span className="text-gray-900">{selectedChat.isGroup ? 'Group' : 'Individual'}</span>
            </div>
            <div className="space-y-1">
              <span className="font-medium text-gray-700">Unread Messages:</span>
              <span className="text-gray-900">{selectedChat.unreadCount || 0}</span>
            </div>
            <div className="space-y-1">
              <span className="font-medium text-gray-700">Last Activity:</span>
              <span className="text-gray-900">{formatTime(selectedChat.timestamp)}</span>
            </div>
          </div>
          
          {selectedChat.lastMessage && (
            <div className="mt-4">
              <span className="font-medium text-gray-700">Last Message:</span>
              <div className="bg-gray-50 p-3 rounded-lg mt-2 italic text-gray-700">
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
