// whatsapp-client-connection.ts
import { Client, LocalAuth, ClientOptions, Chat } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

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

  /**
   * The constructor is private to enforce the singleton pattern.
   * It prevents direct instantiation with `new WhatsappClientConnection()`.
   */
  private constructor() {
    this.client = null;
    this.isReady = false;

    // Call the private initialization method immediately
    this.createClientConnection();
  }

  /**
   * Provides a public, static method to get the single instance of the class.
   * This is the only way to access the singleton.
   * @returns The single instance of WhatsappClientConnection.
   */
  public static getInstance(): whatsappClientConnection {
    if (!whatsappClientConnection.instance) {
      whatsappClientConnection.instance = new whatsappClientConnection();
    }
    return whatsappClientConnection.instance;
  }

  /**
   * Initializes the wweb.js client and sets up all event listeners.
   * This is a private method called only once by the constructor.
   */
  public createClientConnection(): void {
    console.log("create whatsapp connection started");
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
    ];

    const clientOptions: ClientOptions = {
      authStrategy: new LocalAuth({ clientId: WHATSAPP_CLIENT_ID }),
      puppeteer: {
        headless: true,
        args: puppeteerArgs,
        timeout: 0,
        ignoreDefaultArgs: ["--disable-extensions"],
      },
      webVersionCache: {
        type: "remote",
        remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
      },
    };

    this.client = new Client(clientOptions);

    this.client.on("qr", (qr: string) => {
      console.log("🎉 QR Code generated successfully!");
      qrcode.generate(qr, { small: true });
    });

    this.client.on("ready", () => {
      this.isReady = true;
      console.log("🚀 WhatsApp client is ready! The library is now active.");
    });

    this.client.on("authenticated", () => {
      console.log("✅ WhatsApp client authenticated successfully");
    });

    this.client.on("auth_failure", (msg: string) => {
      console.error("❌ Authentication failed:", msg);
    });

    this.client.on("disconnected", (reason: string) => {
      console.log("🔌 WhatsApp client disconnected:", reason);
      this.isReady = false;
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
   * Sends a message to a specific number.
   * @param number The recipient's phone number.
   * @param message The message to send.
   */
  public async sendMessage(number: string, message: string): Promise<void> {
    if (!this.isReady || !this.client) {
      console.error("Library not ready. Cannot send message.");
      return;
    }
    const sanitizedNumber: string = number.includes("@c.us") ? number : `${number}@c.us`;
    try {
      await this.client.sendMessage(sanitizedNumber, message);
      console.log(`Message sent to ${number}`);
    } catch (error) {
      console.error(`Error sending message to ${number}:`, error);
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
}

// Export the single instance of the class
export default whatsappClientConnection.getInstance();