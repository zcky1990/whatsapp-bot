import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Edit, 
  Trash2, 
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Message Templates</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="btn flex items-center justify-center"
        >
          <Plus size={16} className="mr-2" />
          New Template
        </button>
      </div>

      {showForm && (
        <div className="card">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-gray-800">
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </h3>
            <button onClick={resetForm} className="btn btn-secondary p-2">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Template Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter template name"
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
              />
            </div>

            <div className="form-group">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Message Content
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                placeholder="Enter your message template. Use {variable_name} for dynamic content."
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green resize-y"
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">Variables</label>
              {formData.variables.map((variable, index) => (
                <div key={index} className="flex gap-3 mb-3">
                  <input
                    type="text"
                    value={variable}
                    onChange={(e) => updateVariable(index, e.target.value)}
                    placeholder="Variable name (e.g., name, date, amount)"
                    className="flex-1 p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-whatsapp-green"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariable(index)}
                    className="btn btn-danger p-3"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addVariable}
                className="btn btn-secondary flex items-center"
              >
                <Plus size={16} className="mr-2" />
                Add Variable
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button type="submit" className="btn flex items-center justify-center" disabled={loading}>
                <Save size={16} className="mr-2" />
                {loading ? 'Saving...' : (editingTemplate ? 'Update Template' : 'Create Template')}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800 m-0">{template.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(template)}
                  className="btn btn-secondary p-2"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="btn btn-danger p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <strong className="text-sm font-medium text-gray-700">Content:</strong>
              <div className="bg-gray-50 p-3 rounded-lg mt-2 font-mono text-sm text-gray-800">
                {template.content}
              </div>
            </div>

            {template.variables && JSON.parse(template.variables).length > 0 && (
              <div className="mb-4">
                <strong className="text-sm font-medium text-gray-700">Variables:</strong>
                <div className="mt-2 flex flex-wrap gap-2">
                  {JSON.parse(template.variables).map((variable, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500">
              Created: {new Date(template.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="card text-center py-10">
          <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Templates Yet</h3>
          <p className="text-gray-600 mb-5">
            Create your first message template to get started with automated messaging.
          </p>
          <button onClick={() => setShowForm(true)} className="btn flex items-center mx-auto">
            <Plus size={16} className="mr-2" />
            Create Your First Template
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
