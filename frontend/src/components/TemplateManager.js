import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Save,
  X,
  MessageSquare 
} from 'lucide-react';

const TemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    variables: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/templates');
      setTemplates(response.data);
    } catch (error) {
      toast.error('Failed to fetch templates');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTemplate) {
        await axios.put(`/api/templates/${editingTemplate.id}`, formData);
        toast.success('Template updated successfully');
      } else {
        await axios.post('/api/templates', formData);
        toast.success('Template created successfully');
      }
      
      setShowForm(false);
      setEditingTemplate(null);
      setFormData({ name: '', content: '', variables: [] });
      fetchTemplates();
    } catch (error) {
      toast.error('Failed to save template');
    }
    
    setLoading(false);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      content: template.content,
      variables: JSON.parse(template.variables || '[]')
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await axios.delete(`/api/templates/${id}`);
        toast.success('Template deleted successfully');
        fetchTemplates();
      } catch (error) {
        toast.error('Failed to delete template');
      }
    }
  };

  const addVariable = () => {
    setFormData({
      ...formData,
      variables: [...formData.variables, '']
    });
  };

  const updateVariable = (index, value) => {
    const newVariables = [...formData.variables];
    newVariables[index] = value;
    setFormData({
      ...formData,
      variables: newVariables
    });
  };

  const removeVariable = (index) => {
    const newVariables = formData.variables.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      variables: newVariables
    });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTemplate(null);
    setFormData({ name: '', content: '', variables: [] });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Message Templates</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="btn"
        >
          <Plus size={16} style={{ marginRight: '8px' }} />
          New Template
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>{editingTemplate ? 'Edit Template' : 'Create New Template'}</h3>
            <button onClick={resetForm} className="btn btn-secondary">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Template Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter template name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Message Content</label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                placeholder="Enter your message template. Use {variable_name} for dynamic content."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Variables</label>
              {formData.variables.map((variable, index) => (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={variable}
                    onChange={(e) => updateVariable(index, e.target.value)}
                    placeholder="Variable name (e.g., name, date, amount)"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => removeVariable(index)}
                    className="btn btn-danger"
                    style={{ padding: '8px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addVariable}
                className="btn btn-secondary"
                style={{ marginTop: '10px' }}
              >
                <Plus size={16} style={{ marginRight: '8px' }} />
                Add Variable
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn" disabled={loading}>
                <Save size={16} style={{ marginRight: '8px' }} />
                {loading ? 'Saving...' : (editingTemplate ? 'Update Template' : 'Create Template')}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid">
        {templates.map((template) => (
          <div key={template.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>{template.name}</h3>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button
                  onClick={() => handleEdit(template)}
                  className="btn btn-secondary"
                  style={{ padding: '5px' }}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="btn btn-danger"
                  style={{ padding: '5px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Content:</strong>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '10px', 
                borderRadius: '4px', 
                marginTop: '5px',
                fontFamily: 'monospace',
                fontSize: '14px'
              }}>
                {template.content}
              </div>
            </div>

            {template.variables && JSON.parse(template.variables).length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Variables:</strong>
                <div style={{ marginTop: '5px' }}>
                  {JSON.parse(template.variables).map((variable, index) => (
                    <span 
                      key={index}
                      style={{ 
                        background: '#e7f3ff', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontSize: '12px',
                        marginRight: '5px',
                        display: 'inline-block',
                        marginBottom: '5px'
                      }}
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ fontSize: '12px', color: '#666' }}>
              Created: {new Date(template.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="card text-center">
          <MessageSquare size={48} color="#ccc" style={{ marginBottom: '15px' }} />
          <h3>No Templates Yet</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Create your first message template to get started with automated messaging.
          </p>
          <button onClick={() => setShowForm(true)} className="btn">
            <Plus size={16} style={{ marginRight: '8px' }} />
            Create Your First Template
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
