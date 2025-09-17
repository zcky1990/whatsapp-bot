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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Send Messages</h1>
      
      {/* WhatsApp Status */}
      <div className="card">
        <div className="flex items-center mb-3">
          <MessageSquare size={20} className="mr-3 text-whatsapp-green" />
          <h3 className="text-lg font-semibold text-gray-800 m-0">WhatsApp Status</h3>
        </div>
        <div className="flex items-center">
          {isConnected ? (
            <>
              <CheckCircle size={20} className="text-whatsapp-green mr-3" />
              <span className="text-whatsapp-green font-medium">Connected and Ready</span>
            </>
          ) : (
            <>
              <XCircle size={20} className="text-red-600 mr-3" />
              <span className="text-red-600 font-medium">Not Connected</span>
            </>
          )}
        </div>
        {!isConnected && (
          <p className="text-gray-600 mt-3 text-sm">
            Please connect your WhatsApp account first in the WhatsApp section.
          </p>
        )}
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Send Message</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Message Type Selection */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
            >
              <option value="direct">Direct Message</option>
              <option value="template">Template Message</option>
              <option value="ai">AI-Generated Message</option>
            </select>
          </div>

          {/* Recipient */}
          <div className="form-group">
            <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Phone Number
            </label>
            <input
              type="tel"
              id="to"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              required
              placeholder="e.g., +1234567890 or 1234567890"
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
            />
            <small className="text-gray-500 text-xs mt-1 block">
              Include country code (e.g., +1 for US, +44 for UK)
            </small>
          </div>

          {/* Direct Message */}
          {formData.type === 'direct' && (
            <div className="form-group">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message Content
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                placeholder="Type your message here..."
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green resize-y"
              />
            </div>
          )}

          {/* Template Message */}
          {formData.type === 'template' && (
            <>
              <div className="form-group">
                <label htmlFor="templateId" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Template
                </label>
                <select
                  id="templateId"
                  value={formData.templateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Preview</label>
                  <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm text-gray-800">
                    {selectedTemplate.content}
                  </div>
                </div>
              )}

              {templateVariables.map(variable => (
                <div key={variable} className="form-group">
                  <label htmlFor={`var-${variable}`} className="block text-sm font-medium text-gray-700 mb-1">
                    {variable}
                  </label>
                  <input
                    type="text"
                    id={`var-${variable}`}
                    value={formData.templateVariables[variable] || ''}
                    onChange={(e) => updateTemplateVariable(variable, e.target.value)}
                    placeholder={`Enter ${variable}`}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
                  />
                </div>
              ))}
            </>
          )}

          {/* AI Message */}
          {formData.type === 'ai' && (
            <>
              <div className="form-group">
                <label htmlFor="aiConfigId" className="block text-sm font-medium text-gray-700 mb-1">
                  Select AI Configuration
                </label>
                <select
                  id="aiConfigId"
                  value={formData.aiConfigId}
                  onChange={(e) => setFormData({ ...formData, aiConfigId: e.target.value })}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
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
                <label htmlFor="aiMessage" className="block text-sm font-medium text-gray-700 mb-1">
                  Message to AI
                </label>
                <textarea
                  id="aiMessage"
                  value={formData.aiMessage}
                  onChange={(e) => setFormData({ ...formData, aiMessage: e.target.value })}
                  required
                  placeholder="Enter the message or prompt for the AI..."
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green resize-y"
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn w-full flex items-center justify-center" 
            disabled={loading || !isConnected}
          >
            <Send size={16} className="mr-2" />
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Users size={32} className="text-whatsapp-green mx-auto mb-3" />
            <h4 className="text-base font-semibold text-gray-800 mb-2">Direct Messages</h4>
            <p className="text-gray-600 text-sm">
              Send personalized messages directly to contacts
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <MessageSquare size={32} className="text-whatsapp-green mx-auto mb-3" />
            <h4 className="text-base font-semibold text-gray-800 mb-2">Template Messages</h4>
            <p className="text-gray-600 text-sm">
              Use pre-defined templates with dynamic variables
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Bot size={32} className="text-whatsapp-green mx-auto mb-3" />
            <h4 className="text-base font-semibold text-gray-800 mb-2">AI Messages</h4>
            <p className="text-gray-600 text-sm">
              Generate responses using AI agents
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageSender;
