import { Router, Request, Response } from 'express';
import { 
  createAIConfig, 
  getAllAIConfigs, 
  getAIConfigById, 
  updateAIConfig, 
  deleteAIConfig 
} from '../../services/ai-config.service';
import { authenticateToken } from '../../middleware/authenticate';

const aiConfigsRouter = Router();

// Get all AI configs for the authenticated user
aiConfigsRouter.get('/ai-configs', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const aiConfigs = await getAllAIConfigs(userId);
    res.json(aiConfigs);
  } catch (error: any) {
    console.error('Error fetching AI configs:', error);
    res.status(500).json({ error: 'Failed to fetch AI configs' });
  }
});

// Get a specific AI config by ID
aiConfigsRouter.get('/ai-configs/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    const aiConfig = await getAIConfigById(parseInt(id), userId);
    
    if (!aiConfig) {
      return res.status(404).json({ error: 'AI config not found' });
    }
    
    res.json(aiConfig);
  } catch (error: any) {
    console.error('Error fetching AI config:', error);
    res.status(500).json({ error: 'Failed to fetch AI config' });
  }
});

// Create a new AI config
aiConfigsRouter.post('/ai-configs', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, endpoint, api_key } = req.body;
    const userId = (req as any).user.userId;
    
    if (!name || !endpoint || !api_key) {
      return res.status(400).json({ error: 'Name, endpoint, and API key are required' });
    }
    
    const aiConfigData = {
      user_id: userId,
      name,
      endpoint,
      api_key
    };
    
    const aiConfig = await createAIConfig(aiConfigData);
    res.status(201).json(aiConfig);
  } catch (error: any) {
    console.error('Error creating AI config:', error);
    res.status(500).json({ error: 'Failed to create AI config' });
  }
});

// Update an existing AI config
aiConfigsRouter.put('/ai-configs/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, endpoint, api_key } = req.body;
    const userId = (req as any).user.userId;
    
    if (!name || !endpoint || !api_key) {
      return res.status(400).json({ error: 'Name, endpoint, and API key are required' });
    }
    
    const aiConfigData = {
      name,
      endpoint,
      api_key
    };
    
    const aiConfig = await updateAIConfig(parseInt(id), aiConfigData, userId);
    
    if (!aiConfig) {
      return res.status(404).json({ error: 'AI config not found' });
    }
    
    res.json(aiConfig);
  } catch (error: any) {
    console.error('Error updating AI config:', error);
    res.status(500).json({ error: 'Failed to update AI config' });
  }
});

// Delete an AI config
aiConfigsRouter.delete('/ai-configs/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    
    const success = await deleteAIConfig(parseInt(id), userId);
    
    if (!success) {
      return res.status(404).json({ error: 'AI config not found' });
    }
    
    res.json({ message: 'AI config deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting AI config:', error);
    res.status(500).json({ error: 'Failed to delete AI config' });
  }
});

export default aiConfigsRouter;
