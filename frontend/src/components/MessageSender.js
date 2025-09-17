import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useWhatsApp } from '../contexts/WhatsAppContext';
import { 
  Send, 
  MessageSquare, 
  Users, 
  Bot,
  CheckCircle,
  XCircle
} from 'lucide-react';

const MessageSender = () => {
  const { isConnected, status } = useWhatsApp();
  const [templates, setTemplates] = useState([]);
  const [aiConfigs, setAiConfigs] = useState([]);
  const [formData, setFormData] = useState({
    type: 'direct', // direct, template, ai
    to: '',
    message: '',
    templateId: '',
    templateVariables: {},
    aiConfigId: '',
    aiMessage: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchAiConfigs();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/templates');
      setTemplates(response.data);
    } catch (error) {
      toast.error('Failed to fetch templates');
    }
  };

  const fetchAiConfigs = async () => {
    try {
      const response = await axios.get('/api/ai-configs');
      setAiConfigs(response.data);
    } catch (error) {
      toast.error('Failed to fetch AI configurations');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.type === 'direct') {
        await axios.post('/api/whatsapp/send-message', {
          to: formData.to,
          message: formData.message
        });
        toast.success('Message sent successfully!');
      } else if (formData.type === 'template') {
        await axios.post('/api/whatsapp/send-template', {
          to: formData.to,
          templateId: formData.templateId,
          variables: formData.templateVariables
        });
        toast.success('Template message sent successfully!');
      } else if (formData.type === 'ai') {
        // First get AI response, then send it
        const aiResponse = await axios.post('/api/ai-agent/chat', {
          message: formData.aiMessage,
          configId: formData.aiConfigId
        });
        
        await axios.post('/api/whatsapp/send-message', {
          to: formData.to,
          message: aiResponse.data.response
        });
        toast.success('AI-generated message sent successfully!');
      }
      
      // Reset form
      setFormData({
        type: 'direct',
        to: '',
        message: '',
        templateId: '',
        templateVariables: {},
        aiConfigId: '',
        aiMessage: ''
      });
    } catch (error) {
      toast.error('Failed to send message: ' + (error.response?.data?.error || error.message));
    }
    
    setLoading(false);
  };

  const handleTemplateChange = (templateId) => {
    const template = templates.find(t => t.id == templateId);
    if (template) {
      const variables = JSON.parse(template.variables || '[]');
      const templateVariables = {};
      variables.forEach(variable => {
        templateVariables[variable] = '';
      });
      setFormData({
        ...formData,
        templateId,
        templateVariables
      });
    }
  };

  const updateTemplateVariable = (variable, value) => {
    setFormData({
      ...formData,
      templateVariables: {
        ...formData.templateVariables,
        [variable]: value
      }
    });
  };

  const selectedTemplate = templates.find(t => t.id == formData.templateId);
  const templateVariables = selectedTemplate ? JSON.parse(selectedTemplate.variables || '[]') : [];

  return (
    <div>
      <h1>Send Messages</h1>
      
      {/* WhatsApp Status */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <MessageSquare size={20} style={{ marginRight: '10px' }} />
          <h3 style={{ margin: 0 }}>WhatsApp Status</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isConnected ? (
            <>
              <CheckCircle size={20} className="status-connected" style={{ marginRight: '10px' }} />
              <span className="status-connected">Connected and Ready</span>
            </>
          ) : (
            <>
              <XCircle size={20} className="status-disconnected" style={{ marginRight: '10px' }} />
              <span className="status-disconnected">Not Connected</span>
            </>
          )}
        </div>
        {!isConnected && (
          <p style={{ color: '#666', marginTop: '10px', fontSize: '14px' }}>
            Please connect your WhatsApp account first in the WhatsApp section.
          </p>
        )}
      </div>

      <div className="card">
        <h3>Send Message</h3>
        
        <form onSubmit={handleSubmit}>
          {/* Message Type Selection */}
          <div className="form-group">
            <label>Message Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="direct">Direct Message</option>
              <option value="template">Template Message</option>
              <option value="ai">AI-Generated Message</option>
            </select>
          </div>

          {/* Recipient */}
          <div className="form-group">
            <label htmlFor="to">Recipient Phone Number</label>
            <input
              type="tel"
              id="to"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              required
              placeholder="e.g., +1234567890 or 1234567890"
            />
            <small style={{ color: '#666' }}>
              Include country code (e.g., +1 for US, +44 for UK)
            </small>
          </div>

          {/* Direct Message */}
          {formData.type === 'direct' && (
            <div className="form-group">
              <label htmlFor="message">Message Content</label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                placeholder="Type your message here..."
                rows="4"
              />
            </div>
          )}

          {/* Template Message */}
          {formData.type === 'template' && (
            <>
              <div className="form-group">
                <label htmlFor="templateId">Select Template</label>
                <select
                  id="templateId"
                  value={formData.templateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  required
                >
                  <option value="">Choose a template...</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTemplate && (
                <div className="form-group">
                  <label>Template Preview</label>
                  <div style={{ 
                    background: '#f8f9fa', 
                    padding: '10px', 
                    borderRadius: '4px', 
                    marginBottom: '10px',
                    fontFamily: 'monospace',
                    fontSize: '14px'
                  }}>
                    {selectedTemplate.content}
                  </div>
                </div>
              )}

              {templateVariables.map(variable => (
                <div key={variable} className="form-group">
                  <label htmlFor={`var-${variable}`}>{variable}</label>
                  <input
                    type="text"
                    id={`var-${variable}`}
                    value={formData.templateVariables[variable] || ''}
                    onChange={(e) => updateTemplateVariable(variable, e.target.value)}
                    placeholder={`Enter ${variable}`}
                  />
                </div>
              ))}
            </>
          )}

          {/* AI Message */}
          {formData.type === 'ai' && (
            <>
              <div className="form-group">
                <label htmlFor="aiConfigId">Select AI Configuration</label>
                <select
                  id="aiConfigId"
                  value={formData.aiConfigId}
                  onChange={(e) => setFormData({ ...formData, aiConfigId: e.target.value })}
                  required
                >
                  <option value="">Choose an AI configuration...</option>
                  {aiConfigs.map(config => (
                    <option key={config.id} value={config.id}>
                      {config.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="aiMessage">Message to AI</label>
                <textarea
                  id="aiMessage"
                  value={formData.aiMessage}
                  onChange={(e) => setFormData({ ...formData, aiMessage: e.target.value })}
                  required
                  placeholder="Enter the message or prompt for the AI..."
                  rows="3"
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn" 
            disabled={loading || !isConnected}
            style={{ width: '100%' }}
          >
            <Send size={16} style={{ marginRight: '8px' }} />
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      {/* Quick Actions */}
      <div className="card mt-20">
        <h3>Quick Actions</h3>
        <div className="grid" style={{ marginTop: '15px' }}>
          <div style={{ textAlign: 'center' }}>
            <Users size={32} color="#25D366" style={{ marginBottom: '10px' }} />
            <h4>Direct Messages</h4>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Send personalized messages directly to contacts
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <MessageSquare size={32} color="#25D366" style={{ marginBottom: '10px' }} />
            <h4>Template Messages</h4>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Use pre-defined templates with dynamic variables
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Bot size={32} color="#25D366" style={{ marginBottom: '10px' }} />
            <h4>AI Messages</h4>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Generate responses using AI agents
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageSender;
