import { Server, Socket } from 'socket.io';

export default function registerSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`A user connected: ${socket.id}`);

    // Handle client disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });

    socket.on('init-whatsapp', () => {
        console.log('Received init-whatsapp request');
    });
    
  });
}