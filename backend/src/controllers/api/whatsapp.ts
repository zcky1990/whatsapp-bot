import { Router, Request, Response } from 'express';
import whatsappClientConnection from '../../lib/whatsappClientConnection';
import { authenticateToken } from '../../middleware/authenticate';
import { Server } from 'socket.io';

const whatsappRouter = Router();

// Get WhatsApp connection status
whatsappRouter.get('/whatsapp/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const instance = whatsappClientConnection.getInstance();
    if (!instance) {
      return res.json({
        ready: false,
        status: 'disconnected',
        connected: false
      });
    }
    
    const status = instance.getConnectionStatus();
    res.json({
      ready: status.isReady,
      status: status.status,
      connected: status.isReady
    });
  } catch (error: any) {
    console.error('Error getting WhatsApp status:', error);
    res.status(500).json({ error: 'Failed to get WhatsApp status' });
  }
});

// Send a direct message
whatsappRouter.post('/whatsapp/send-message', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ error: 'Recipient number and message are required' });
    }
    
    // Check if WhatsApp is ready
    const whatsappInstance = whatsappClientConnection.getInstance();
    if (!whatsappInstance || !whatsappInstance.isConnectionReady()) {
      return res.status(400).json({ error: 'WhatsApp is not connected. Please connect WhatsApp first.' });
    }
    
    // Send the message
    await whatsappInstance.sendMessage(to, message);
    
    res.json({ 
      success: true, 
      message: 'Message sent successfully',
      to: to,
      content: message
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message: ' + error.message });
  }
});

// Send a template message
whatsappRouter.post('/whatsapp/send-template', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { to, templateId, variables } = req.body;
    
    if (!to || !templateId) {
      return res.status(400).json({ error: 'Recipient number and template ID are required' });
    }
    
    // Check if WhatsApp is ready
    const whatsappInstance = whatsappClientConnection.getInstance();
    if (!whatsappInstance || !whatsappInstance.isConnectionReady()) {
      return res.status(400).json({ error: 'WhatsApp is not connected. Please connect WhatsApp first.' });
    }
    
    // TODO: Implement template message sending
    // For now, return a placeholder response
    res.json({ 
      success: true, 
      message: 'Template message functionality not yet implemented',
      to: to,
      templateId: templateId,
      variables: variables
    });
  } catch (error: any) {
    console.error('Error sending template message:', error);
    res.status(500).json({ error: 'Failed to send template message: ' + error.message });
  }
});

// Get WhatsApp connection info
whatsappRouter.get('/whatsapp/info', authenticateToken, async (req: Request, res: Response) => {
  try {
    const whatsappInstance = whatsappClientConnection.getInstance();
    if (!whatsappInstance) {
      return res.json({
        status: 'disconnected',
        isReady: false,
        connected: false,
        timestamp: new Date().toISOString()
      });
    }
    
    const status = whatsappInstance.getConnectionStatus();
    
    res.json({
      status: status.status,
      isReady: status.isReady,
      connected: status.isReady,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error getting WhatsApp info:', error);
    res.status(500).json({ error: 'Failed to get WhatsApp info' });
  }
});

// Restart WhatsApp client
whatsappRouter.post('/whatsapp/restart', authenticateToken, async (req: Request, res: Response) => {
  try {
    const whatsappInstance = whatsappClientConnection.getInstance();
    if (!whatsappInstance) {
      return res.status(400).json({ error: 'WhatsApp client not initialized' });
    }
    
    await whatsappInstance.restartClient();
    
    res.json({ 
      success: true, 
      message: 'WhatsApp client restart initiated successfully' 
    });
  } catch (error: any) {
    console.error('Error restarting WhatsApp client:', error);
    res.status(500).json({ error: 'Failed to restart WhatsApp client: ' + error.message });
  }
});

// Test WhatsApp connection (for debugging)
whatsappRouter.get('/whatsapp/test', authenticateToken, async (req: Request, res: Response) => {
  try {
    const whatsappInstance = whatsappClientConnection.getInstance();
    if (!whatsappInstance) {
      return res.json({
        success: false,
        message: 'WhatsApp client not initialized',
        status: 'not_initialized'
      });
    }
    
    const status = whatsappInstance.getConnectionStatus();
    
    res.json({
      success: true,
      message: 'WhatsApp client status retrieved',
      status: status.status,
      isReady: status.isReady,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error testing WhatsApp connection:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to test WhatsApp connection: ' + error.message 
    });
  }
});

// Debug WhatsApp Web interface (for troubleshooting)
whatsappRouter.get('/whatsapp/debug', authenticateToken, async (req: Request, res: Response) => {
  try {
    const whatsappInstance = whatsappClientConnection.getInstance();
    if (!whatsappInstance) {
      return res.status(400).json({ error: 'WhatsApp client not initialized' });
    }
    
    const client = (whatsappInstance as any).client;
    if (!client) {
      return res.status(400).json({ error: 'WhatsApp client not available' });
    }
    
    const page = await client.pupPage;
    if (!page) {
      return res.status(400).json({ error: 'WhatsApp Web page not available' });
    }
    
    // Get page info
    const pageInfo = await page.evaluate(() => {
      const selectors = [
        '[data-testid="chat-list"]',
        '[data-testid="conversation-compose-box-input"]',
        '[data-testid="send"]',
        '[data-testid="compose-box-input"]',
        'div[contenteditable="true"]',
        'div[role="textbox"]',
        '[data-icon="send"]',
        'button[aria-label="Send"]'
      ];
      
      const foundSelectors: { [key: string]: boolean } = {};
      selectors.forEach(selector => {
        const element = document.querySelector(selector);
        foundSelectors[selector] = !!element;
      });
      
      return {
        url: window.location.href,
        title: document.title,
        foundSelectors,
        bodyClasses: document.body.className,
        hasApp: !!document.querySelector('#app')
      };
    });
    
    res.json({
      success: true,
      pageInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error debugging WhatsApp Web:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to debug WhatsApp Web: ' + error.message 
    });
  }
});

// Get all WhatsApp chats
whatsappRouter.get('/whatsapp/chats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const whatsappInstance = whatsappClientConnection.getInstance();
    if (!whatsappInstance || !whatsappInstance.isConnectionReady()) {
      return res.status(400).json({ error: 'WhatsApp is not connected. Please connect WhatsApp first.' });
    }
    
    const chats = await whatsappInstance.getAllChats();
    
    // Format chats for frontend
    const formattedChats = chats.map(chat => ({
      id: chat.id._serialized,
      name: chat.name || chat.id.user || 'Unknown',
      isGroup: chat.isGroup,
      isReadOnly: chat.isReadOnly,
      unreadCount: chat.unreadCount,
      lastMessage: chat.lastMessage ? {
        body: chat.lastMessage.body,
        timestamp: chat.lastMessage.timestamp,
        fromMe: chat.lastMessage.fromMe
      } : null,
      timestamp: chat.timestamp
    }));
    
    res.json({
      success: true,
      chats: formattedChats,
      count: formattedChats.length
    });
  } catch (error: any) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats: ' + error.message });
  }
});

// Start a new chat
whatsappRouter.post('/whatsapp/start-chat', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    const whatsappInstance = whatsappClientConnection.getInstance();
    if (!whatsappInstance || !whatsappInstance.isConnectionReady()) {
      return res.status(400).json({ error: 'WhatsApp is not connected. Please connect WhatsApp first.' });
    }
    
    const chatId = await whatsappInstance.startChat(phoneNumber);
    
    if (!chatId) {
      return res.status(400).json({ error: 'Could not start chat. Phone number may not be on WhatsApp.' });
    }
    
    res.json({
      success: true,
      chatId: chatId,
      message: 'Chat started successfully'
    });
  } catch (error: any) {
    console.error('Error starting chat:', error);
    res.status(500).json({ error: 'Failed to start chat: ' + error.message });
  }
});

// Get chat details
whatsappRouter.get('/whatsapp/chats/:chatId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    
    const whatsappInstance = whatsappClientConnection.getInstance();
    if (!whatsappInstance || !whatsappInstance.isConnectionReady()) {
      return res.status(400).json({ error: 'WhatsApp is not connected. Please connect WhatsApp first.' });
    }
    
    const chat = await whatsappInstance.getChatById(chatId);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Format chat for frontend
    const formattedChat = {
      id: chat.id._serialized,
      name: chat.name || chat.id.user || 'Unknown',
      isGroup: chat.isGroup,
      isReadOnly: chat.isReadOnly,
      unreadCount: chat.unreadCount,
      lastMessage: chat.lastMessage ? {
        body: chat.lastMessage.body,
        timestamp: chat.lastMessage.timestamp,
        fromMe: chat.lastMessage.fromMe
      } : null,
      timestamp: chat.timestamp
    };
    
    res.json({
      success: true,
      chat: formattedChat
    });
  } catch (error: any) {
    console.error('Error fetching chat details:', error);
    res.status(500).json({ error: 'Failed to fetch chat details: ' + error.message });
  }
});

// Get chat messages
whatsappRouter.get('/whatsapp/chats/:chatId/messages', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { limit = 50 } = req.query;
    
    const whatsappInstance = whatsappClientConnection.getInstance();
    if (!whatsappInstance || !whatsappInstance.isConnectionReady()) {
      return res.status(400).json({ error: 'WhatsApp is not connected. Please connect WhatsApp first.' });
    }
    
    const messages = await whatsappInstance.getChatMessages(chatId, parseInt(limit as string));
    
    res.json({
      success: true,
      messages: messages,
      count: messages.length
    });
  } catch (error: any) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages: ' + error.message });
  }
});

// Send message to specific chat
whatsappRouter.post('/whatsapp/chats/:chatId/send', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    
    const whatsappInstance = whatsappClientConnection.getInstance();
    if (!whatsappInstance || !whatsappInstance.isConnectionReady()) {
      return res.status(400).json({ error: 'WhatsApp is not connected. Please connect WhatsApp first.' });
    }
    
    const sentMessage = await whatsappInstance.sendMessageToChat(chatId, message.trim());
    
    if (!sentMessage) {
      return res.status(400).json({ error: 'Failed to send message' });
    }
    
    res.json({
      success: true,
      message: sentMessage,
      messageText: 'Message sent successfully'
    });
  } catch (error: any) {
    console.error('Error sending message to chat:', error);
    res.status(500).json({ error: 'Failed to send message: ' + error.message });
  }
});

export default whatsappRouter;
