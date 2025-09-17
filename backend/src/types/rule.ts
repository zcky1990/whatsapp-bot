export interface Rule {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  is_active: boolean;
  priority: number;
  
  // Condition fields
  condition_type: 'keyword' | 'regex' | 'sender' | 'time' | 'message_type' | 'custom';
  condition_value: string;
  condition_operator: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'regex' | 'not_contains' | 'not_equals';
  
  // Action fields
  action_type: 'reply' | 'forward' | 'auto_reply' | 'webhook' | 'template' | 'ai_response' | 'custom';
  action_value: string;
  action_data?: string; // JSON data for complex actions
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface CreateRuleData {
  user_id: number;
  name: string;
  description?: string;
  is_active?: boolean;
  priority?: number;
  condition_type: Rule['condition_type'];
  condition_value: string;
  condition_operator?: Rule['condition_operator'];
  action_type: Rule['action_type'];
  action_value: string;
  action_data?: string;
}

export interface UpdateRuleData {
  name?: string;
  description?: string;
  is_active?: boolean;
  priority?: number;
  condition_type?: Rule['condition_type'];
  condition_value?: string;
  condition_operator?: Rule['condition_operator'];
  action_type?: Rule['action_type'];
  action_value?: string;
  action_data?: string;
}

export interface RuleCondition {
  type: Rule['condition_type'];
  value: string;
  operator: Rule['condition_operator'];
}

export interface RuleAction {
  type: Rule['action_type'];
  value: string;
  data?: any;
}

export interface MessageContext {
  messageId: string;
  body: string;
  from: string;
  to: string;
  fromMe: boolean;
  timestamp: number;
  type: string;
  chatId: string;
  senderName?: string;
  isGroup: boolean;
}

export interface RuleExecutionResult {
  ruleId: number;
  ruleName: string;
  executed: boolean;
  actionType: string;
  result?: any;
  error?: string;
}
