import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Bot, 
  Save,
  X,
  Link,
  Key
} from 'lucide-react';

const AIConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    endpoint: '',
    api_key: ''
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await axios.get('/api/ai-configs');
      setConfigs(response.data);
    } catch (error) {
      toast.error('Failed to fetch AI configurations');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingConfig) {
        await axios.put(`/api/ai-configs/${editingConfig.id}`, formData);
        toast.success('AI configuration updated successfully');
      } else {
        await axios.post('/api/ai-configs', formData);
        toast.success('AI configuration created successfully');
      }
      
      setShowForm(false);
      setEditingConfig(null);
      setFormData({ name: '', endpoint: '', api_key: '' });
      fetchConfigs();
    } catch (error) {
      toast.error('Failed to save AI configuration');
    }
    
    setLoading(false);
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      endpoint: config.endpoint,
      api_key: config.api_key
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this AI configuration?')) {
      try {
        await axios.delete(`/api/ai-configs/${id}`);
        toast.success('AI configuration deleted successfully');
        fetchConfigs();
      } catch (error) {
        toast.error('Failed to delete AI configuration');
      }
    }
  };

  const testConnection = async (config) => {
    setTesting(true);
    try {
      await axios.post('/api/ai-agent/chat', {
        message: 'Hello, this is a test message.',
        configId: config.id
      });
      toast.success('AI connection test successful!');
    } catch (error) {
      toast.error('AI connection test failed: ' + (error.response?.data?.error || error.message));
    }
    setTesting(false);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingConfig(null);
    setFormData({ name: '', endpoint: '', api_key: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">AI Agent Configuration</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="btn flex items-center justify-center"
        >
          <Plus size={16} className="mr-2" />
          New AI Config
        </button>
      </div>

      {showForm && (
        <div className="card">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-gray-800">
              {editingConfig ? 'Edit AI Configuration' : 'Create New AI Configuration'}
            </h3>
            <button onClick={resetForm} className="btn btn-secondary p-2">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Configuration Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter configuration name (e.g., OpenAI GPT-4)"
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
              />
            </div>

            <div className="form-group">
              <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 mb-1">
                API Endpoint
              </label>
              <input
                type="url"
                id="endpoint"
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                required
                placeholder="https://api.openai.com/v1/chat/completions"
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
              />
            </div>

            <div className="form-group">
              <label htmlFor="api_key" className="block text-sm font-medium text-gray-700 mb-1">
                API Key (Optional)
              </label>
              <input
                type="password"
                id="api_key"
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                placeholder="Enter your API key (leave empty if not required)"
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-5">
              <strong className="text-blue-800">API Format:</strong>
              <p className="text-blue-700 text-sm mt-1">
                The endpoint should accept POST requests with a JSON body containing a "message" field. 
                If an API key is provided, it will be sent in the Authorization header as "Bearer {'{'}api_key{'}'}". 
                Leave the API key empty for public APIs or APIs that don't require authentication.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button type="submit" className="btn flex items-center justify-center" disabled={loading}>
                <Save size={16} className="mr-2" />
                {loading ? 'Saving...' : (editingConfig ? 'Update Configuration' : 'Create Configuration')}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {configs.map((config) => (
          <div key={config.id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800 m-0">{config.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => testConnection(config)}
                  className="btn p-2"
                  disabled={testing}
                  title="Test Connection"
                >
                  <Bot size={16} />
                </button>
                <button
                  onClick={() => handleEdit(config)}
                  className="btn btn-secondary p-2"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(config.id)}
                  className="btn btn-danger p-2"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center mb-2">
                <Link size={16} className="mr-2 text-gray-500" />
                <strong className="text-sm font-medium text-gray-700">Endpoint:</strong>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm text-gray-800 break-all">
                {config.endpoint}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center mb-2">
                <Key size={16} className="mr-2 text-gray-500" />
                <strong className="text-sm font-medium text-gray-700">API Key:</strong>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm text-gray-800">
                {config.api_key ? '••••••••••••••••' : 'Not set'}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Created: {new Date(config.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {configs.length === 0 && (
        <div className="card text-center py-10">
          <Bot size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No AI Configurations Yet</h3>
          <p className="text-gray-600 mb-5">
            Configure AI agents to integrate with external services and APIs for enhanced functionality.
          </p>
          <button onClick={() => setShowForm(true)} className="btn flex items-center mx-auto">
            <Plus size={16} className="mr-2" />
            Create Your First AI Configuration
          </button>
        </div>
      )}

      {/* Help Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Integration Help</h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-base font-medium text-gray-700 mb-3">Supported AI Services:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="font-medium text-gray-800 mr-2">•</span>
                <div>
                  <strong>OpenAI GPT:</strong> https://api.openai.com/v1/chat/completions
                </div>
              </li>
              <li className="flex items-start">
                <span className="font-medium text-gray-800 mr-2">•</span>
                <div>
                  <strong>Anthropic Claude:</strong> https://api.anthropic.com/v1/messages
                </div>
              </li>
              <li className="flex items-start">
                <span className="font-medium text-gray-800 mr-2">•</span>
                <div>
                  <strong>Google Gemini:</strong> https://generativelanguage.googleapis.com/v1beta/models
                </div>
              </li>
              <li className="flex items-start">
                <span className="font-medium text-gray-800 mr-2">•</span>
                <div>
                  <strong>Custom APIs:</strong> Any REST API that accepts POST requests
                </div>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-base font-medium text-gray-700 mb-3">API Requirements:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="font-medium text-gray-800 mr-2">•</span>
                <div>Must accept POST requests</div>
              </li>
              <li className="flex items-start">
                <span className="font-medium text-gray-800 mr-2">•</span>
                <div>Must accept JSON body with "message" field</div>
              </li>
              <li className="flex items-start">
                <span className="font-medium text-gray-800 mr-2">•</span>
                <div>Should support Bearer token authentication (optional)</div>
              </li>
              <li className="flex items-start">
                <span className="font-medium text-gray-800 mr-2">•</span>
                <div>Should return JSON response</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConfig;
