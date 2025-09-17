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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>AI Agent Configuration</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="btn"
        >
          <Plus size={16} style={{ marginRight: '8px' }} />
          New AI Config
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>{editingConfig ? 'Edit AI Configuration' : 'Create New AI Configuration'}</h3>
            <button onClick={resetForm} className="btn btn-secondary">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Configuration Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter configuration name (e.g., OpenAI GPT-4)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="endpoint">API Endpoint</label>
              <input
                type="url"
                id="endpoint"
                value={formData.endpoint}
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                required
                placeholder="https://api.openai.com/v1/chat/completions"
              />
            </div>

            <div className="form-group">
              <label htmlFor="api_key">API Key (Optional)</label>
              <input
                type="password"
                id="api_key"
                value={formData.api_key}
                onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                placeholder="Enter your API key (leave empty if not required)"
              />
            </div>

            <div style={{ 
              background: '#e7f3ff', 
              padding: '15px', 
              borderRadius: '4px', 
              marginBottom: '20px',
              border: '1px solid #b3d9ff'
            }}>
              <strong>API Format:</strong> The endpoint should accept POST requests with a JSON body containing a "message" field. If an API key is provided, it will be sent in the Authorization header as "Bearer {'{'}api_key{'}'}". Leave the API key empty for public APIs or APIs that don't require authentication.
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn" disabled={loading}>
                <Save size={16} style={{ marginRight: '8px' }} />
                {loading ? 'Saving...' : (editingConfig ? 'Update Configuration' : 'Create Configuration')}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid">
        {configs.map((config) => (
          <div key={config.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>{config.name}</h3>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button
                  onClick={() => testConnection(config)}
                  className="btn"
                  disabled={testing}
                  style={{ padding: '5px' }}
                >
                  <Bot size={16} />
                </button>
                <button
                  onClick={() => handleEdit(config)}
                  className="btn btn-secondary"
                  style={{ padding: '5px' }}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(config.id)}
                  className="btn btn-danger"
                  style={{ padding: '5px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <Link size={16} style={{ marginRight: '8px', color: '#666' }} />
                <strong>Endpoint:</strong>
              </div>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '8px', 
                borderRadius: '4px', 
                fontSize: '14px',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                {config.endpoint}
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <Key size={16} style={{ marginRight: '8px', color: '#666' }} />
                <strong>API Key:</strong>
              </div>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '8px', 
                borderRadius: '4px', 
                fontSize: '14px',
                fontFamily: 'monospace'
              }}>
                {config.api_key ? '••••••••••••••••' : 'Not set'}
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#666' }}>
              Created: {new Date(config.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {configs.length === 0 && (
        <div className="card text-center">
          <Bot size={48} color="#ccc" style={{ marginBottom: '15px' }} />
          <h3>No AI Configurations Yet</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Configure AI agents to integrate with external services and APIs for enhanced functionality.
          </p>
          <button onClick={() => setShowForm(true)} className="btn">
            <Plus size={16} style={{ marginRight: '8px' }} />
            Create Your First AI Configuration
          </button>
        </div>
      )}

      {/* Help Section */}
      <div className="card mt-20">
        <h3>AI Integration Help</h3>
        <div style={{ marginTop: '15px' }}>
          <h4>Supported AI Services:</h4>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            <li><strong>OpenAI GPT:</strong> https://api.openai.com/v1/chat/completions</li>
            <li><strong>Anthropic Claude:</strong> https://api.anthropic.com/v1/messages</li>
            <li><strong>Google Gemini:</strong> https://generativelanguage.googleapis.com/v1beta/models</li>
            <li><strong>Custom APIs:</strong> Any REST API that accepts POST requests</li>
          </ul>
          
          <h4 style={{ marginTop: '20px' }}>API Requirements:</h4>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            <li>Must accept POST requests</li>
            <li>Must accept JSON body with "message" field</li>
            <li>Should support Bearer token authentication (optional)</li>
            <li>Should return JSON response</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIConfig;
