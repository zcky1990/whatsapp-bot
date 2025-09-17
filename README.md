# WhatsApp Bot with Frontend Configuration

A comprehensive WhatsApp bot application with a modern web interface for configuration and management. Built with Node.js backend and React frontend.

## Features

- 🔐 **User Authentication** - Secure login and registration system
- 📱 **WhatsApp Integration** - Connect WhatsApp using QR code scanning
- 📝 **Template Management** - Create and manage message templates with variables
- 🤖 **AI Agent Integration** - Connect to external AI services via HTTP
- 💬 **Message Sending** - Send direct messages, template messages, or AI-generated messages
- 🎨 **Modern UI** - Clean, responsive interface built with React
- 🔄 **Real-time Updates** - Socket.io integration for live status updates

## Tech Stack

### Backend
- Node.js with Express
- whatsapp-web.js for WhatsApp integration
- SQLite database
- Socket.io for real-time communication
- JWT authentication
- QR code generation

### Frontend
- React 18
- React Router for navigation
- Socket.io client
- React Toastify for notifications
- Lucide React for icons
- Styled Components

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cursor-whatsapp-bot
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Seed admin user (optional)**
   ```bash
   npm run seed
   ```
   
   This creates an admin user with:
   - Username: `admin`
   - Password: `rahasia`

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

## Usage

### 1. Initial Setup
- Open your browser and go to `http://localhost:3000`
- Login with admin credentials:
  - Username: `admin`
  - Password: `rahasia`
- Or create a new account if you prefer

### 2. Connect WhatsApp
- Navigate to the WhatsApp section
- Click "Connect WhatsApp" to generate a QR code
- Open WhatsApp on your phone
- Go to Settings → Linked Devices → Link a Device
- Scan the QR code displayed in the web interface

### 3. Create Message Templates
- Go to the Templates section
- Click "New Template" to create a message template
- Use `{variable_name}` syntax for dynamic content
- Define variables that can be filled when sending messages

### 4. Configure AI Agents
- Navigate to AI Config section
- Add AI service configurations (OpenAI, Claude, etc.)
- Provide API endpoint and authentication key
- Test the connection to ensure it's working

### 5. Send Messages
- Go to Send Message section
- Choose message type:
  - **Direct**: Send a simple text message
  - **Template**: Use a pre-defined template with variables
  - **AI**: Generate message using AI agent
- Enter recipient phone number (with country code)
- Send your message

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Templates
- `GET /api/templates` - Get user templates
- `POST /api/templates` - Create new template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### AI Configuration
- `GET /api/ai-configs` - Get AI configurations
- `POST /api/ai-configs` - Create AI configuration
- `POST /api/ai-agent/chat` - Send message to AI agent

### WhatsApp
- `GET /api/whatsapp/status` - Get WhatsApp connection status
- `POST /api/whatsapp/send-message` - Send direct message
- `POST /api/whatsapp/send-template` - Send template message

## Environment Variables

Create a `.env` file in the server directory:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

## Database

The application uses SQLite database with the following tables:
- `users` - User accounts
- `templates` - Message templates
- `ai_configs` - AI service configurations

## Socket.io Events

### Client to Server
- `init-whatsapp` - Initialize WhatsApp connection

### Server to Client
- `qr` - QR code data URL
- `whatsapp-ready` - WhatsApp connected
- `whatsapp-authenticated` - WhatsApp authenticated
- `whatsapp-error` - Connection error
- `whatsapp-disconnected` - Connection lost

## AI Integration

The application supports integration with various AI services:

### OpenAI GPT
```json
{
  "name": "OpenAI GPT-4",
  "endpoint": "https://api.openai.com/v1/chat/completions",
  "api_key": "your-openai-api-key"
}
```

### Anthropic Claude
```json
{
  "name": "Claude",
  "endpoint": "https://api.anthropic.com/v1/messages",
  "api_key": "your-claude-api-key"
}
```

### Public API (No Authentication)
```json
{
  "name": "Public Chat API",
  "endpoint": "https://api.example.com/chat",
  "api_key": ""
}
```

### Custom APIs
Any REST API that:
- Accepts POST requests
- Accepts JSON body with "message" field
- Optionally supports Bearer token authentication
- Returns JSON response

## Template Variables

Templates support dynamic variables using `{variable_name}` syntax:

**Template:**
```
Hello {name}, your order #{order_id} is ready for pickup at {location}.
```

**Variables:**
- `name` - Customer name
- `order_id` - Order number
- `location` - Pickup location

## Database Seeding

The application includes a seeding script to create an admin user for initial setup.

### Run Seeding
```bash
# From project root
npm run seed

# Or from server directory
cd server && npm run seed
```

### Admin User Credentials
- **Username**: `admin`
- **Password**: `rahasia`

### Seeding Features
- Creates admin user with hashed password
- Checks for existing admin user to prevent duplicates
- Provides clear feedback on success/failure

### Manual Database Reset
If you need to reset the database:
```bash
# Delete the database file
rm server/database.sqlite

# Restart the server (will recreate database)
npm run dev

# Run seeding again
npm run seed
```

## Security Notes

- Change the JWT secret in production
- Use HTTPS in production
- Validate all inputs
- Implement rate limiting
- Use environment variables for sensitive data

## Troubleshooting

### WhatsApp Connection Issues
- Ensure your phone has internet connection
- Keep WhatsApp open on your phone
- Try regenerating the QR code
- Check if WhatsApp Web is already connected elsewhere

### AI Integration Issues
- Verify API endpoint URL
- Check API key validity
- Ensure API supports the expected format
- Test connection using the test button

### Database Issues
- Check if database file has proper permissions
- Ensure SQLite is properly installed
- Verify database schema is created correctly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation
- Open an issue on GitHub

---

Built with ❤️ using Node.js, React, and whatsapp-web.js
