import { Router, Request, Response } from 'express';
import { 
  createRule, 
  getAllRules, 
  getRuleById, 
  updateRule, 
  deleteRule,
  toggleRuleStatus,
  getActiveRules,
  getRulesByConditionType
} from '../../services/rule.service';
import { authenticateToken } from '../../middleware/authenticate';

const rulesRouter = Router();

// Get all rules for the authenticated user
rulesRouter.get('/rules', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { active_only, condition_type } = req.query;
    
    let rules;
    if (active_only === 'true') {
      rules = await getActiveRules(userId);
    } else if (condition_type) {
      rules = await getRulesByConditionType(userId, condition_type as string);
    } else {
      rules = await getAllRules(userId);
    }
    
    res.json(rules);
  } catch (error: any) {
    console.error('Error fetching rules:', error);
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
});

// Get a specific rule by ID
rulesRouter.get('/rules/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    
    const rule = await getRuleById(parseInt(id));
    
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    
    if (rule.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(rule);
  } catch (error: any) {
    console.error('Error fetching rule:', error);
    res.status(500).json({ error: 'Failed to fetch rule' });
  }
});

// Create a new rule
rulesRouter.post('/rules', authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      is_active = true,
      priority = 0,
      condition_type,
      condition_value,
      condition_operator = 'contains',
      action_type,
      action_value,
      action_data
    } = req.body;
    
    const userId = (req as any).user.userId;
    
    if (!name || !condition_type || !condition_value || !action_type || !action_value) {
      return res.status(400).json({ 
        error: 'Name, condition_type, condition_value, action_type, and action_value are required' 
      });
    }
    
    const ruleData = {
      user_id: userId,
      name,
      description,
      is_active,
      priority,
      condition_type,
      condition_value,
      condition_operator,
      action_type,
      action_value,
      action_data: action_data ? JSON.stringify(action_data) : undefined
    };
    
    const rule = await createRule(ruleData);
    res.status(201).json(rule);
  } catch (error: any) {
    console.error('Error creating rule:', error);
    res.status(500).json({ error: 'Failed to create rule' });
  }
});

// Update an existing rule
rulesRouter.put('/rules/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    const updateData = { ...req.body };
    
    // Convert action_data to JSON string if it's an object
    if (updateData.action_data && typeof updateData.action_data === 'object') {
      updateData.action_data = JSON.stringify(updateData.action_data);
    }
    
    const rule = await updateRule(parseInt(id), updateData, userId);
    
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    
    res.json(rule);
  } catch (error: any) {
    console.error('Error updating rule:', error);
    res.status(500).json({ error: 'Failed to update rule' });
  }
});

// Delete a rule
rulesRouter.delete('/rules/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    
    const deleted = await deleteRule(parseInt(id), userId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    
    res.json({ message: 'Rule deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting rule:', error);
    res.status(500).json({ error: 'Failed to delete rule' });
  }
});

// Toggle rule status (active/inactive)
rulesRouter.patch('/rules/:id/toggle', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    
    const rule = await toggleRuleStatus(parseInt(id), userId);
    
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    
    res.json(rule);
  } catch (error: any) {
    console.error('Error toggling rule status:', error);
    res.status(500).json({ error: 'Failed to toggle rule status' });
  }
});

// Test a rule condition (for preview/testing)
rulesRouter.post('/rules/test-condition', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { condition_type, condition_value, condition_operator, test_message } = req.body;
    
    if (!condition_type || !condition_value || !test_message) {
      return res.status(400).json({ 
        error: 'condition_type, condition_value, and test_message are required' 
      });
    }
    
    const matches = testRuleCondition(
      { type: condition_type, value: condition_value, operator: condition_operator || 'contains' },
      test_message
    );
    
    res.json({ matches, condition: { condition_type, condition_value, condition_operator } });
  } catch (error: any) {
    console.error('Error testing rule condition:', error);
    res.status(500).json({ error: 'Failed to test rule condition' });
  }
});

// Helper function to test rule conditions
function testRuleCondition(condition: any, message: string): boolean {
  const { type, value, operator } = condition;
  
  switch (type) {
    case 'keyword':
      return testStringCondition(message.toLowerCase(), value.toLowerCase(), operator);
    case 'regex':
      try {
        const regex = new RegExp(value, 'i');
        return regex.test(message);
      } catch (error) {
        return false;
      }
    case 'sender':
      // This would need the actual sender info in a real implementation
      return testStringCondition(message.toLowerCase(), value.toLowerCase(), operator);
    case 'time':
      // This would need time-based logic in a real implementation
      return false;
    case 'message_type':
      return testStringCondition(message.toLowerCase(), value.toLowerCase(), operator);
    default:
      return false;
  }
}

function testStringCondition(text: string, value: string, operator: string): boolean {
  switch (operator) {
    case 'contains':
      return text.includes(value);
    case 'equals':
      return text === value;
    case 'starts_with':
      return text.startsWith(value);
    case 'ends_with':
      return text.endsWith(value);
    case 'not_contains':
      return !text.includes(value);
    case 'not_equals':
      return text !== value;
    default:
      return text.includes(value);
  }
}

export default rulesRouter;
