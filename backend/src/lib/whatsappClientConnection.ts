// whatsapp-client-connection.ts
import { Client, LocalAuth, ClientOptions, Chat } from "whatsapp-web.js";
import qrcode from "qrcode";
import { Server, Socket } from 'socket.io';
import rulesEngine from '../services/rulesEngine.service';

/**
 * A singleton class for managing a single WhatsApp Web client connection.
 * It ensures only one instance of the client is created and provides
 * a centralized way to interact with it.
 */
class whatsappClientConnection {
  // Use TypeScript's private fields for the singleton instance and internal state.
  // The `#` prefix makes them truly private at the language level.
  private static instance: whatsappClientConnection;
  private client: Client | null;
  private isReady: boolean;
  private isInitializing: boolean;
  private io: Server;
  /**
   * The constructor is private to enforce the singleton pattern.
   * It prevents direct instantiation with `new WhatsappClientConnection()`.
   */
  private constructor(io: Server) {
    this.client = null;
    this.isReady = false;
    this.isInitializing = false;
    this.io = io;
    // Call the private initialization method immediately
    this.createClientConnection();
  }

  /**
   * Provides a public, static method to get the single instance of the class.
   * This is the only way to access the singleton.
   * @param io Optional Server instance for initialization
   * @returns The single instance of WhatsappClientConnection.
   */
  public static getInstance(io?: Server): whatsappClientConnection {
    if (!whatsappClientConnection.instance && io) {
      whatsappClientConnection.instance = new whatsappClientConnection(io);
    }
    return whatsappClientConnection.instance;
  }

  /**
   * Initializes the wweb.js client and sets up all event listeners.
   * This is a private method called only once by the constructor.
   */
  public createClientConnection(): void {
    console.log("create whatsapp connection started");
    this.isInitializing = true;
    const WHATSAPP_CLIENT_ID: string = process.env.WHATSAPP_CLIENT_ID || "whatsapp-bot";

    console.log(`Set new client with client ID ${WHATSAPP_CLIENT_ID}`);

    const puppeteerArgs: string[] = [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
      "--disable-blink-features=AutomationControlled",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--disable-features=TranslateUI",
      "--disable-ipc-flooding-protection",
      "--no-default-browser-check",
      "--disable-default-apps",
      "--disable-popup-blocking",
      "--disable-prompt-on-repost",
      "--disable-hang-monitor",
      "--disable-sync",
      "--disable-background-networking",
      "--disable-client-side-phishing-detection",
      "--disable-component-extensions-with-background-pages",
      "--disable-extensions",
      "--disable-features=Translate",
      "--disable-plugins",
      "--disable-plugins-discovery",
      "--disable-preconnect",
      "--disable-print-preview",
      "--disable-speech-api",
      "--hide-scrollbars",
      "--mute-audio",
      "--no-zygote",
      "--disable-accelerated-2d-canvas",
      "--disable-accelerated-jpeg-decoding",
      "--disable-accelerated-mjpeg-decode",
      "--disable-accelerated-video-decode",
      "--disable-gpu-sandbox",
      "--disable-software-rasterizer"
    ];

    const clientOptions: ClientOptions = {
      authStrategy: new LocalAuth({ clientId: WHATSAPP_CLIENT_ID }),
      puppeteer: {
        headless: true,
        args: puppeteerArgs,
        timeout: 60000, // 60 seconds timeout
        ignoreDefaultArgs: ["--disable-extensions"],
        executablePath: undefined, // Use system Chrome/Chromium
        handleSIGINT: false,
        handleSIGTERM: false,
        handleSIGHUP: false,
      },
      webVersionCache: {
        type: "remote",
        remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2413.54.html",
      },
      restartOnAuthFail: true,
      takeoverOnConflict: true,
      takeoverTimeoutMs: 0,
    };

    this.client = new Client(clientOptions);

    this.client.on("qr", async (qr: string) => {
      console.log("🎉 QR Code generated successfully!", qr);
      try {
        const qrCode = await qrcode.toDataURL(qr);
        this.io.emit("qr", qrCode);
      } catch (error) {
        console.error("Error generating QR code data URL:", error);
      }
    });

    this.client.on("ready", () => {
      this.isReady = true;
      this.isInitializing = false;
      console.log("🚀 WhatsApp client is ready! The library is now active.");
      console.log("Emitting whatsapp-ready event to all clients");
      this.io.emit("whatsapp-ready");
    });

    this.client.on("authenticated", () => {
      console.log("✅ WhatsApp client authenticated successfully");
      console.log("Emitting whatsapp-authenticated event to all clients");
      this.io.emit("whatsapp-authenticated");
    });

    this.client.on("auth_failure", (msg: string) => {
      console.error("❌ Authentication failed:", msg);
      console.log("Emitting whatsapp-error event to all clients");
      this.io.emit("whatsapp-error", { message: msg });
    });

    this.client.on("disconnected", (reason: string) => {
      console.log("🔌 WhatsApp client disconnected:", reason);
      this.isReady = false;
      this.isInitializing = false;
      console.log("Emitting whatsapp-disconnected event to all clients");
      this.io.emit("whatsapp-disconnected", { reason });
    });

    this.client.on("loading_screen", (percent: string, message: string) => {
      console.log("Loading screen:", percent, message);
    });

    this.client.on("change_state", (state: string) => {
      console.log("WhatsApp state changed:", state);
    });

    this.client.on("remote_session_saved", () => {
      console.log("Remote session saved");
    });

    // Handle incoming messages for rules processing
    this.client.on("message", async (message) => {
      try {
        // Only process messages that are not from us
        if (message.fromMe) {
          return;
        }

        console.log("Incoming message received:", {
          from: message.from,
          body: message.body,
          type: message.type,
          timestamp: message.timestamp
        });

        // Create message context for rules engine
        const messageContext = {
          messageId: message.id._serialized,
          body: message.body || '',
          from: message.from,
          to: message.to,
          fromMe: message.fromMe,
          timestamp: message.timestamp,
          type: message.type,
          chatId: message.from,
          isGroup: message.from.includes('@g.us')
        };

        // Process through rules engine
        // Note: We need to get the user ID somehow - this is a limitation
        // For now, we'll process rules for all users (you might want to modify this)
        const results = await rulesEngine.processMessage(1, messageContext); // Using user ID 1 as default
        
        if (results && results.length > 0) {
          console.log("Rules processing results:", results);
          
          // Emit results to frontend via socket
          this.io.emit("rules-processed", {
            messageId: message.id._serialized,
            results: results
          });
        }
      } catch (error) {
        console.error("Error processing message through rules engine:", error);
      }
    });

    this.client.initialize();
  }

  // --- Public API Methods ---
  /**
   * Checks the readiness status of the WhatsApp client.
   * @returns true if the client is ready, false otherwise.
   */
  public isConnectionReady(): boolean {
    return this.isReady;
  }

  /**
   * Gets the current WhatsApp connection status.
   * @returns Object containing connection status information.
   */
  public getConnectionStatus(): { isReady: boolean; status: string } {
    let status = 'disconnected';
    if (this.isReady) {
      status = 'connected';
    } else if (this.isInitializing) {
      status = 'initializing';
    }
    
    return {
      isReady: this.isReady,
      status: status
    };
  }

  /**
   * Sends a message to a specific number with retry logic.
   * @param number The recipient's phone number.
   * @param message The message to send.
   * @param retries Number of retry attempts (default: 3).
   */
  public async sendMessage(number: string, message: string, retries: number = 3): Promise<void> {
    if (!this.isReady || !this.client) {
      throw new Error("WhatsApp client is not ready. Cannot send message.");
    }
    
    const sanitizedNumber: string = number.includes("@c.us") ? number : `${number}@c.us`;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Attempting to send message to ${sanitizedNumber} (attempt ${attempt}/${retries})`);
        
        // Add a delay to ensure WhatsApp Web is fully loaded
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if client is still ready before sending
        if (!this.isReady || !this.client) {
          throw new Error("WhatsApp client became unavailable during sending");
        }
        
        // Check if WhatsApp Web interface is properly loaded
        const isWebReady = await this.isWhatsAppWebReady();
        if (!isWebReady) {
          throw new Error("WhatsApp Web interface is not fully loaded");
        }
        
        // Try the standard sendMessage method first
        try {
          await this.client.sendMessage(sanitizedNumber, message);
          console.log(`✅ Message sent successfully to ${number}`);
          return; // Success, exit the retry loop
        } catch (sendError: any) {
          // If standard method fails, try alternative approach
          if (sendError.message && sendError.message.includes('Evaluation failed')) {
            console.log('🔄 Standard sendMessage failed, trying alternative approach...');
            try {
              await this.sendMessageAlternative(sanitizedNumber, message);
              console.log(`✅ Message sent successfully to ${number} (alternative method)`);
              return;
            } catch (altError: any) {
              console.log('🔄 Alternative method failed, trying simple retry...');
              // Try a simple retry with just the client method
              await new Promise(resolve => setTimeout(resolve, 3000));
              try {
                await this.client.sendMessage(sanitizedNumber, message);
                console.log(`✅ Message sent successfully to ${number} (retry method)`);
                return;
              } catch (retryError: any) {
                throw new Error(`All send methods failed. Last error: ${retryError.message}`);
              }
            }
          } else {
            throw sendError; // Re-throw if it's not an evaluation error
          }
        }
        
      } catch (error: any) {
        console.error(`❌ Error sending message to ${number} (attempt ${attempt}/${retries}):`, error);
        
        // Check if it's a Puppeteer evaluation error
        if (error.message && error.message.includes('Evaluation failed')) {
          console.error('Puppeteer evaluation error detected. This might be due to WhatsApp Web interface changes.');
          
          if (attempt === retries) {
            // Last attempt failed, try to restart the client
            console.log('🔄 Last attempt failed, trying to restart WhatsApp client...');
            try {
              await this.restartClient();
              throw new Error('WhatsApp Web interface error. Client has been restarted. Please try again in a few moments.');
            } catch (restartError) {
              throw new Error('WhatsApp Web interface error. Please try reconnecting WhatsApp.');
            }
          } else {
            // Wait longer before retry
            console.log(`⏳ Waiting 5 seconds before retry ${attempt + 1}...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            continue;
          }
        }
        
        // Check if it's a connection error
        if (error.message && (error.message.includes('Protocol error') || error.message.includes('Target closed'))) {
          console.error('Connection error detected. WhatsApp might have disconnected.');
          this.isReady = false;
          throw new Error('WhatsApp connection lost. Please reconnect.');
        }
        
        // For other errors, retry with exponential backoff
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
          console.log(`⏳ Waiting ${delay/1000} seconds before retry ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Last attempt failed
          throw error;
        }
      }
    }
  }

  /**
   * Fetches chat details by a given chat ID.
   * @param chatId The ID of the chat.
   * @returns The chat object or null if not found or the client is not ready.
   */
  public async getChatById(chatId: string): Promise<Chat | null> {
    if (!this.isReady || !this.client) {
      console.error("Library not ready. Cannot fetch chat.");
      return null;
    }
    try {
      const chat: Chat = await this.client.getChatById(chatId);
      console.log(`Fetched chat with ID: ${chat.id._serialized}`);
      return chat;
    } catch (error) {
      console.error(`Error fetching chat ${chatId}:`, error);
      return null;
    }
  }

  /**
   * Gets all chats from WhatsApp.
   * @returns Array of chat objects or empty array if not ready.
   */
  public async getAllChats(): Promise<Chat[]> {
    if (!this.isReady || !this.client) {
      console.error("Library not ready. Cannot fetch chats.");
      return [];
    }
    try {
      const chats: Chat[] = await this.client.getChats();
      console.log(`Fetched ${chats.length} chats`);
      return chats;
    } catch (error) {
      console.error("Error fetching chats:", error);
      return [];
    }
  }

  /**
   * Starts a new chat with a phone number.
   * @param phoneNumber The phone number to start a chat with.
   * @returns The chat ID if successful, null otherwise.
   */
  public async startChat(phoneNumber: string): Promise<string | null> {
    if (!this.isReady || !this.client) {
      console.error("Library not ready. Cannot start chat.");
      return null;
    }
    try {
      // Sanitize phone number
      const sanitizedNumber = phoneNumber.includes("@c.us") ? phoneNumber : `${phoneNumber}@c.us`;
      
      // Get or create chat
      const chatId = await this.client.getNumberId(sanitizedNumber);
      if (chatId) {
        console.log(`Started chat with ${phoneNumber}`);
        return chatId._serialized;
      } else {
        console.error(`Could not find WhatsApp account for ${phoneNumber}`);
        return null;
      }
    } catch (error) {
      console.error(`Error starting chat with ${phoneNumber}:`, error);
      return null;
    }
  }

  /**
   * Gets message history for a specific chat.
   * @param chatId The ID of the chat.
   * @param limit Maximum number of messages to fetch (default: 50).
   * @returns Array of messages or empty array if not ready.
   */
  public async getChatMessages(chatId: string, limit: number = 50): Promise<any[]> {
    if (!this.isReady || !this.client) {
      console.error("Library not ready. Cannot fetch messages.");
      return [];
    }
    try {
      const chat = await this.client.getChatById(chatId);
      if (!chat) {
        console.error(`Chat ${chatId} not found`);
        return [];
      }
      
      const messages = await chat.fetchMessages({ limit });
      console.log(`Fetched ${messages.length} messages for chat ${chatId}`);
      
      // Format messages for frontend
      return messages.map(msg => ({
        id: msg.id._serialized,
        body: msg.body,
        from: msg.from,
        to: msg.to,
        fromMe: msg.fromMe,
        timestamp: msg.timestamp,
        type: msg.type,
        hasMedia: msg.hasMedia,
        mediaUrl: msg.hasMedia ? (msg as any).mediaUrl : null,
        quotedMsg: (msg as any).quotedMsg ? {
          id: (msg as any).quotedMsg.id._serialized,
          body: (msg as any).quotedMsg.body,
          fromMe: (msg as any).quotedMsg.fromMe
        } : null
      }));
    } catch (error) {
      console.error(`Error fetching messages for chat ${chatId}:`, error);
      return [];
    }
  }

  /**
   * Sends a message to a specific chat.
   * @param chatId The ID of the chat to send the message to.
   * @param message The message content to send.
   * @returns The sent message object or null if failed.
   */
  public async sendMessageToChat(chatId: string, message: string): Promise<any | null> {
    if (!this.isReady || !this.client) {
      console.error("Library not ready. Cannot send message.");
      return null;
    }
    try {
      const chat = await this.client.getChatById(chatId);
      if (!chat) {
        console.error(`Chat ${chatId} not found`);
        return null;
      }
      
      const sentMessage = await chat.sendMessage(message);
      console.log(`Message sent to chat ${chatId}: ${message}`);
      
      return {
        id: sentMessage.id._serialized,
        body: sentMessage.body,
        from: sentMessage.from,
        to: sentMessage.to,
        fromMe: sentMessage.fromMe,
        timestamp: sentMessage.timestamp,
        type: sentMessage.type
      };
    } catch (error) {
      console.error(`Error sending message to chat ${chatId}:`, error);
      return null;
    }
  }

  /**
   * Checks if WhatsApp Web interface is properly loaded and ready.
   * @returns Promise<boolean> indicating if the interface is ready.
   */
  private async isWhatsAppWebReady(): Promise<boolean> {
    if (!this.client) return false;
    
    try {
      // Try to get the page to check if WhatsApp Web is loaded
      const page = await this.client.pupPage;
      if (!page) return false;
      
      // Check if the main WhatsApp Web elements are present
      const isReady = await page.evaluate(() => {
        // Check for common WhatsApp Web elements
        const chatList = document.querySelector('[data-testid="chat-list"]');
        const messageInput = document.querySelector('[data-testid="conversation-compose-box-input"]');
        const appWrapper = document.querySelector('#app');
        
        return !!(chatList || messageInput || appWrapper);
      });
      
      return isReady;
    } catch (error) {
      console.error('Error checking WhatsApp Web readiness:', error);
      return false;
    }
  }

  /**
   * Alternative method to send messages when the standard method fails.
   * This method uses direct DOM manipulation as a fallback.
   * @param number The recipient's phone number.
   * @param message The message to send.
   */
  private async sendMessageAlternative(number: string, message: string): Promise<void> {
    if (!this.client) {
      throw new Error("WhatsApp client is not available");
    }

    try {
      const page = await this.client.pupPage;
      if (!page) {
        throw new Error("WhatsApp Web page is not available");
      }

      console.log(`🔄 Trying alternative method for ${number}`);

      // First, try to find the chat in the chat list
      const chatFound = await page.evaluate((phoneNumber) => {
        // Look for the chat in the chat list
        const chatElements = document.querySelectorAll('[data-testid="cell-frame-container"]');
        for (const element of chatElements) {
          const text = element.textContent || '';
          if (text.includes(phoneNumber.replace('+', '')) || text.includes(phoneNumber)) {
            (element as HTMLElement).click();
            return true;
          }
        }
        return false;
      }, number);

      if (!chatFound) {
        console.log('Chat not found in list, trying direct navigation...');
        // If chat not found, try direct navigation
        await page.goto(`https://web.whatsapp.com/send?phone=${number}`, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
        await page.waitForTimeout(5000);
      }

      // Wait for the message input to be available
      await page.waitForTimeout(2000);

      // Try multiple selectors for the message input
      const inputSelectors = [
        '[data-testid="conversation-compose-box-input"]',
        '[data-testid="compose-box-input"]',
        'div[contenteditable="true"][data-testid="conversation-compose-box-input"]',
        'div[contenteditable="true"]',
        'div[role="textbox"]'
      ];

      let inputElement = null;
      for (const selector of inputSelectors) {
        try {
          inputElement = await page.$(selector);
          if (inputElement) {
            console.log(`Found input with selector: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!inputElement) {
        throw new Error('Could not find message input field');
      }

      // Clear and type the message
      await inputElement.click();
      await page.waitForTimeout(500);
      
      // Clear existing content
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyA');
      await page.keyboard.up('Control');
      await page.keyboard.press('Delete');
      
      // Type the message
      await page.keyboard.type(message);
      await page.waitForTimeout(1000);

      // Try multiple selectors for the send button
      const sendSelectors = [
        '[data-testid="send"]',
        '[data-icon="send"]',
        'button[aria-label="Send"]',
        'span[data-icon="send"]',
        'div[data-testid="send"]'
      ];

      let sendButton = null;
      for (const selector of sendSelectors) {
        try {
          sendButton = await page.$(selector);
          if (sendButton) {
            console.log(`Found send button with selector: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!sendButton) {
        // Try pressing Enter as fallback
        console.log('Send button not found, trying Enter key...');
        await page.keyboard.press('Enter');
      } else {
        await sendButton.click();
      }

      // Wait for the message to be sent
      await page.waitForTimeout(3000);

      console.log(`✅ Message sent via alternative method to ${number}`);
    } catch (error) {
      console.error('Alternative sendMessage method failed:', error);
      throw new Error('Both standard and alternative send methods failed');
    }
  }

  /**
   * Restarts the WhatsApp client connection.
   * Useful when encountering persistent errors.
   */
  public async restartClient(): Promise<void> {
    try {
      console.log("🔄 Restarting WhatsApp client...");
      
      if (this.client) {
        await this.client.destroy();
      }
      
      this.isReady = false;
      this.isInitializing = false;
      
      // Wait a moment before recreating
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Recreate the client connection
      this.createClientConnection();
      
      console.log("✅ WhatsApp client restart initiated");
    } catch (error) {
      console.error("❌ Error restarting WhatsApp client:", error);
      throw error;
    }
  }
}

// Export the single instance of the class
export default whatsappClientConnection;