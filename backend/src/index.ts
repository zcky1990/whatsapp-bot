// src/index.ts
import express, { Request, Response } from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';

import  authRouter from './controllers/api/auth';
import registerSocketHandlers from './websocket'; // Import the handler function

// Load environment variables from .env file
dotenv.config();

const app = express();
const server: http.Server = http.createServer(app);

// Create websocket server
const io: Server = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

registerSocketHandlers(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (res: Response) => {
  res.send('Hello, world from TypeScript and Express!');
});

app.use('/api', authRouter);

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server gracefully shut down.');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server gracefully shut down.');
    process.exit(0);
  });
});