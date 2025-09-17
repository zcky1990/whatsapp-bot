import { getActiveRules } from './rule.service';
import { Rule, MessageContext, RuleExecutionResult } from '../types/rule';
import whatsappClientConnection from '../lib/whatsappClientConnection';

export class RulesEngine {
  private static instance: RulesEngine;

  public static getInstance(): RulesEngine {
    if (!RulesEngine.instance) {
      RulesEngine.instance = new RulesEngine();
    }
    return RulesEngine.instance;
  }

  /**
   * Process incoming message against all active rules
   */
  public async processMessage(userId: number, messageContext: MessageContext): Promise<RuleExecutionResult[]> {
    try {
      const activeRules = await getActiveRules(userId);
      const results: RuleExecutionResult[] = [];

      // Sort rules by priority (highest first)
      const sortedRules = activeRules.sort((a, b) => b.priority - a.priority);

      for (const rule of sortedRules) {
        try {
          const matches = this.evaluateCondition(rule, messageContext);
          
          if (matches) {
            const result = await this.executeAction(rule, messageContext);
            results.push({
              ruleId: rule.id,
              ruleName: rule.name,
              executed: true,
              actionType: rule.action_type,
              result: result
            });

            // If rule is set to stop after first match, break
            if (this.shouldStopAfterMatch(rule)) {
              break;
            }
          } else {
            results.push({
              ruleId: rule.id,
              ruleName: rule.name,
              executed: false,
              actionType: rule.action_type
            });
          }
        } catch (error) {
          console.error(`Error processing rule ${rule.id}:`, error);
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            executed: false,
            actionType: rule.action_type,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error in rules engine:', error);
      return [];
    }
  }

  /**
   * Evaluate if a rule condition matches the message context
   */
  private evaluateCondition(rule: Rule, context: MessageContext): boolean {
    const { condition_type, condition_value, condition_operator } = rule;

    switch (condition_type) {
      case 'keyword':
        return this.testStringCondition(context.body, condition_value, condition_operator);
      
      case 'regex':
        try {
          const regex = new RegExp(condition_value, 'i');
          return regex.test(context.body);
        } catch (error) {
          console.error('Invalid regex pattern:', condition_value);
          return false;
        }
      
      case 'sender':
        return this.testStringCondition(context.from, condition_value, condition_operator);
      
      case 'time':
        return this.evaluateTimeCondition(condition_value, context.timestamp);
      
      case 'message_type':
        return this.testStringCondition(context.type, condition_value, condition_operator);
      
      case 'custom':
        return this.evaluateCustomCondition(condition_value, context);
      
      default:
        return false;
    }
  }

  /**
   * Execute the rule action
   */
  private async executeAction(rule: Rule, context: MessageContext): Promise<any> {
    const { action_type, action_value, action_data } = rule;
    const whatsappClient = whatsappClientConnection.getInstance();

    try {
      switch (action_type) {
        case 'reply':
          return await this.executeReplyAction(action_value, context, whatsappClient);
        
        case 'auto_reply':
          return await this.executeAutoReplyAction(action_value, context, whatsappClient);
        
        case 'forward':
          return await this.executeForwardAction(action_value, context, whatsappClient);
        
        case 'template':
          return await this.executeTemplateAction(action_value, action_data, context, whatsappClient);
        
        case 'ai_response':
          return await this.executeAIResponseAction(action_value, action_data, context, whatsappClient);
        
        case 'webhook':
          return await this.executeWebhookAction(action_value, action_data, context);
        
        case 'custom':
          return await this.executeCustomAction(action_value, action_data, context);
        
        default:
          throw new Error(`Unknown action type: ${action_type}`);
      }
    } catch (error) {
      console.error(`Error executing action ${action_type}:`, error);
      throw error;
    }
  }

  /**
   * Execute reply action
   */
  private async executeReplyAction(message: string, context: MessageContext, whatsappClient: any): Promise<any> {
    if (!whatsappClient.isReady) {
      throw new Error('WhatsApp client not ready');
    }

    return await whatsappClient.sendMessageToChat(context.chatId, message);
  }

  /**
   * Execute auto-reply action
   */
  private async executeAutoReplyAction(message: string, context: MessageContext, whatsappClient: any): Promise<any> {
    // Auto-reply is similar to reply but might have different logic
    return await this.executeReplyAction(message, context, whatsappClient);
  }

  /**
   * Execute forward action
   */
  private async executeForwardAction(targetChatId: string, context: MessageContext, whatsappClient: any): Promise<any> {
    if (!whatsappClient.isReady) {
      throw new Error('WhatsApp client not ready');
    }

    // Forward the original message to target chat
    const forwardMessage = `Forwarded from ${context.from}:\n${context.body}`;
    return await whatsappClient.sendMessageToChat(targetChatId, forwardMessage);
  }

  /**
   * Execute template action
   */
  private async executeTemplateAction(templateId: string, actionData: any, context: MessageContext, whatsappClient: any): Promise<any> {
    if (!whatsappClient.isReady) {
      throw new Error('WhatsApp client not ready');
    }

    // Parse template variables from action data
    const variables = actionData?.variables || {};
    
    // Replace template variables in the message
    let message = actionData?.template_content || '';
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });

    return await whatsappClient.sendMessageToChat(context.chatId, message);
  }

  /**
   * Execute AI response action
   */
  private async executeAIResponseAction(aiConfigId: string, actionData: any, context: MessageContext, whatsappClient: any): Promise<any> {
    if (!whatsappClient.isReady) {
      throw new Error('WhatsApp client not ready');
    }

    // This would integrate with your AI service
    // For now, return a placeholder response
    const aiResponse = `AI Response: ${context.body}`;
    return await whatsappClient.sendMessageToChat(context.chatId, aiResponse);
  }

  /**
   * Execute webhook action
   */
  private async executeWebhookAction(webhookUrl: string, actionData: any, context: MessageContext): Promise<any> {
    const payload = {
      message: context.body,
      from: context.from,
      to: context.to,
      timestamp: context.timestamp,
      chatId: context.chatId,
      ...actionData
    };

    // Make HTTP request to webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    return await response.json();
  }

  /**
   * Execute custom action
   */
  private async executeCustomAction(actionValue: string, actionData: any, context: MessageContext): Promise<any> {
    // Custom action logic would go here
    console.log('Executing custom action:', actionValue, actionData, context);
    return { success: true, action: 'custom' };
  }

  /**
   * Test string conditions
   */
  private testStringCondition(text: string, value: string, operator: string): boolean {
    const lowerText = text.toLowerCase();
    const lowerValue = value.toLowerCase();

    switch (operator) {
      case 'contains':
        return lowerText.includes(lowerValue);
      case 'equals':
        return lowerText === lowerValue;
      case 'starts_with':
        return lowerText.startsWith(lowerValue);
      case 'ends_with':
        return lowerText.endsWith(lowerValue);
      case 'not_contains':
        return !lowerText.includes(lowerValue);
      case 'not_equals':
        return lowerText !== lowerValue;
      default:
        return lowerText.includes(lowerValue);
    }
  }

  /**
   * Evaluate time-based conditions
   */
  private evaluateTimeCondition(conditionValue: string, timestamp: number): boolean {
    try {
      const date = new Date(timestamp * 1000);
      const hour = date.getHours();
      const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Parse condition (e.g., "9-17" for business hours, "1-5" for weekdays)
      const [start, end] = conditionValue.split('-').map(Number);
      
      if (start !== undefined && end !== undefined) {
        // Time range condition
        return hour >= start && hour <= end;
      } else {
        // Day of week condition
        return day >= start && day <= end;
      }
    } catch (error) {
      console.error('Error evaluating time condition:', error);
      return false;
    }
  }

  /**
   * Evaluate custom conditions
   */
  private evaluateCustomCondition(conditionValue: string, context: MessageContext): boolean {
    // Custom condition logic would go here
    // This could be JavaScript code evaluation or other custom logic
    console.log('Evaluating custom condition:', conditionValue, context);
    return false;
  }

  /**
   * Determine if processing should stop after this rule matches
   */
  private shouldStopAfterMatch(rule: Rule): boolean {
    // This could be configurable per rule
    // For now, we'll continue processing all rules
    return false;
  }
}

export default RulesEngine.getInstance();
