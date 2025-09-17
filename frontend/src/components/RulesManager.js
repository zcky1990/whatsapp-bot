import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Play,
  Pause,
  Settings,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Send,
  Bot,
  Webhook,
  FileText,
  Zap
} from 'lucide-react';

const RulesManager = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    priority: 0,
    condition_type: 'keyword',
    condition_value: '',
    condition_operator: 'contains',
    action_type: 'reply',
    action_value: '',
    action_data: ''
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/rules');
      setRules(response.data);
    } catch (error) {
      toast.error('Failed to fetch rules');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingRule) {
        await axios.put(`/api/rules/${editingRule.id}`, formData);
        toast.success('Rule updated successfully!');
      } else {
        await axios.post('/api/rules', formData);
        toast.success('Rule created successfully!');
      }
      
      setShowForm(false);
      setEditingRule(null);
      resetForm();
      fetchRules();
    } catch (error) {
      toast.error('Failed to save rule: ' + (error.response?.data?.error || error.message));
    }
    setLoading(false);
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      is_active: rule.is_active,
      priority: rule.priority,
      condition_type: rule.condition_type,
      condition_value: rule.condition_value,
      condition_operator: rule.condition_operator,
      action_type: rule.action_type,
      action_value: rule.action_value,
      action_data: rule.action_data || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) {
      return;
    }

    try {
      await axios.delete(`/api/rules/${ruleId}`);
      toast.success('Rule deleted successfully!');
      fetchRules();
    } catch (error) {
      toast.error('Failed to delete rule');
    }
  };

  const handleToggleStatus = async (ruleId) => {
    try {
      await axios.patch(`/api/rules/${ruleId}/toggle`);
      toast.success('Rule status updated!');
      fetchRules();
    } catch (error) {
      toast.error('Failed to toggle rule status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_active: true,
      priority: 0,
      condition_type: 'keyword',
      condition_value: '',
      condition_operator: 'contains',
      action_type: 'reply',
      action_value: '',
      action_data: ''
    });
  };

  const getConditionTypeIcon = (type) => {
    switch (type) {
      case 'keyword': return <Search size={16} />;
      case 'regex': return <Filter size={16} />;
      case 'sender': return <MessageSquare size={16} />;
      case 'time': return <Clock size={16} />;
      case 'message_type': return <FileText size={16} />;
      case 'custom': return <Settings size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getActionTypeIcon = (type) => {
    switch (type) {
      case 'reply': return <Send size={16} />;
      case 'auto_reply': return <MessageSquare size={16} />;
      case 'forward': return <Send size={16} />;
      case 'template': return <FileText size={16} />;
      case 'ai_response': return <Bot size={16} />;
      case 'webhook': return <Webhook size={16} />;
      case 'custom': return <Zap size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getConditionTypeLabel = (type) => {
    switch (type) {
      case 'keyword': return 'Keyword';
      case 'regex': return 'Regex Pattern';
      case 'sender': return 'Sender';
      case 'time': return 'Time';
      case 'message_type': return 'Message Type';
      case 'custom': return 'Custom';
      default: return type;
    }
  };

  const getActionTypeLabel = (type) => {
    switch (type) {
      case 'reply': return 'Reply';
      case 'auto_reply': return 'Auto Reply';
      case 'forward': return 'Forward';
      case 'template': return 'Template';
      case 'ai_response': return 'AI Response';
      case 'webhook': return 'Webhook';
      case 'custom': return 'Custom';
      default: return type;
    }
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || rule.condition_type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Rules Manager</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="btn flex items-center justify-center"
        >
          <Plus size={16} className="mr-2" />
          Add New Rule
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
          >
            <option value="all">All Condition Types</option>
            <option value="keyword">Keyword</option>
            <option value="regex">Regex Pattern</option>
            <option value="sender">Sender</option>
            <option value="time">Time</option>
            <option value="message_type">Message Type</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      {/* Rules List */}
      <div className="card">
        {loading && rules.length === 0 ? (
          <div className="text-center py-10">
            <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-whatsapp-green" />
            <p className="text-gray-600">Loading rules...</p>
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="text-center py-10">
            <Settings size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Rules Found</h3>
            <p className="text-gray-600 mb-5">
              {searchTerm || filterType !== 'all' 
                ? 'No rules match your search criteria.' 
                : 'You don\'t have any rules yet. Create your first rule to automate responses.'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <button 
                onClick={() => setShowForm(true)}
                className="btn flex items-center mx-auto"
              >
                <Plus size={16} className="mr-2" />
                Create Your First Rule
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              {filteredRules.length} rule{filteredRules.length !== 1 ? 's' : ''} found
            </div>
            
            {filteredRules.map((rule) => (
              <div key={rule.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{rule.name}</h3>
                      <div className="flex items-center gap-2">
                        {rule.is_active ? (
                          <span className="flex items-center text-green-600 text-sm">
                            <CheckCircle size={16} className="mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-500 text-sm">
                            <Pause size={16} className="mr-1" />
                            Inactive
                          </span>
                        )}
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          Priority: {rule.priority}
                        </span>
                      </div>
                    </div>
                    
                    {rule.description && (
                      <p className="text-gray-600 text-sm mb-3">{rule.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getConditionTypeIcon(rule.condition_type)}
                          <span className="font-medium text-gray-700">Condition:</span>
                          <span className="text-sm text-gray-600">
                            {getConditionTypeLabel(rule.condition_type)} - {rule.condition_operator}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-sm font-mono text-gray-800">
                          {rule.condition_value}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getActionTypeIcon(rule.action_type)}
                          <span className="font-medium text-gray-700">Action:</span>
                          <span className="text-sm text-gray-600">
                            {getActionTypeLabel(rule.action_type)}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-sm font-mono text-gray-800">
                          {rule.action_value}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleStatus(rule.id)}
                      className="p-2 text-gray-500 hover:text-whatsapp-green transition-colors"
                      title={rule.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {rule.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    <button
                      onClick={() => handleEdit(rule)}
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rule Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingRule ? 'Edit Rule' : 'Create New Rule'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingRule(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rule Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
                      placeholder="e.g., Auto-reply to greetings"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
                      placeholder="0"
                    />
                    <small className="text-gray-500 text-xs">Higher numbers = higher priority</small>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green resize-y"
                    rows="2"
                    placeholder="Optional description of what this rule does"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition Type *
                    </label>
                    <select
                      value={formData.condition_type}
                      onChange={(e) => setFormData({ ...formData, condition_type: e.target.value })}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
                    >
                      <option value="keyword">Keyword</option>
                      <option value="regex">Regex Pattern</option>
                      <option value="sender">Sender</option>
                      <option value="time">Time</option>
                      <option value="message_type">Message Type</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Operator
                    </label>
                    <select
                      value={formData.condition_operator}
                      onChange={(e) => setFormData({ ...formData, condition_operator: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
                    >
                      <option value="contains">Contains</option>
                      <option value="equals">Equals</option>
                      <option value="starts_with">Starts With</option>
                      <option value="ends_with">Ends With</option>
                      <option value="not_contains">Not Contains</option>
                      <option value="not_equals">Not Equals</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action Type *
                    </label>
                    <select
                      value={formData.action_type}
                      onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
                    >
                      <option value="reply">Reply</option>
                      <option value="auto_reply">Auto Reply</option>
                      <option value="forward">Forward</option>
                      <option value="template">Template</option>
                      <option value="ai_response">AI Response</option>
                      <option value="webhook">Webhook</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition Value *
                  </label>
                  <input
                    type="text"
                    value={formData.condition_value}
                    onChange={(e) => setFormData({ ...formData, condition_value: e.target.value })}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
                    placeholder="e.g., hello, hi, hey"
                  />
                  <small className="text-gray-500 text-xs">
                    {formData.condition_type === 'regex' 
                      ? 'Enter a regular expression pattern'
                      : 'Enter the value to match against'
                    }
                  </small>
                </div>
                
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action Value *
                  </label>
                  <textarea
                    value={formData.action_value}
                    onChange={(e) => setFormData({ ...formData, action_value: e.target.value })}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green resize-y"
                    rows="3"
                    placeholder="Enter the action to perform (message, webhook URL, etc.)"
                  />
                </div>
                
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action Data (JSON)
                  </label>
                  <textarea
                    value={formData.action_data}
                    onChange={(e) => setFormData({ ...formData, action_data: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green resize-y font-mono"
                    rows="3"
                    placeholder='{"key": "value"}'
                  />
                  <small className="text-gray-500 text-xs">
                    Optional JSON data for complex actions (templates, webhooks, etc.)
                  </small>
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingRule(null);
                      resetForm();
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (editingRule ? 'Update Rule' : 'Create Rule')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RulesManager;
