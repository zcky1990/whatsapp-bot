import { Router, Request, Response } from 'express';
import { 
  createTemplate, 
  getAllTemplates, 
  getTemplateById, 
  updateTemplate, 
  deleteTemplate 
} from '../../services/template.service';
import { authenticateToken } from '../../middleware/authenticate';

const templatesRouter = Router();

// Get all templates for the authenticated user
templatesRouter.get('/templates', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    console.log('userId', userId);
    const templates = await getAllTemplates(userId);
    res.json(templates);
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get a specific template by ID
templatesRouter.get('/templates/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    const template = await getTemplateById(parseInt(id), userId);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(template);
  } catch (error: any) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Create a new template
templatesRouter.post('/templates', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, content, variables } = req.body;
    const userId = (req as any).user.userId;
    
    if (!name || !content) {
      return res.status(400).json({ error: 'Name and content are required' });
    }
    
    const templateData = {
      user_id: userId,
      name,
      content,
      variables: JSON.stringify(variables || [])
    };
    
    const template = await createTemplate(templateData);
    res.status(201).json(template);
  } catch (error: any) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update an existing template
templatesRouter.put('/templates/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, content, variables } = req.body;
    const userId = (req as any).user.userId;
    
    if (!name || !content) {
      return res.status(400).json({ error: 'Name and content are required' });
    }
    
    const templateData = {
      name,
      content,
      variables: JSON.stringify(variables || [])
    };
    
    const template = await updateTemplate(parseInt(id), templateData, userId);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(template);
  } catch (error: any) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete a template
templatesRouter.delete('/templates/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    
    const success = await deleteTemplate(parseInt(id), userId);
    
    if (!success) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({ message: 'Template deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

export default templatesRouter;
