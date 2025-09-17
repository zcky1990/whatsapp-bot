import { Server, Socket } from 'socket.io';
import whatsappClientConnection from './lib/whatsappClientConnection';

export default function registerSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`A user connected: ${socket.id}`);

    // Handle client disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });

    socket.on('init-whatsapp', () => {
        console.log('Received init-whatsapp request');
        whatsappClientConnection.getInstance(io); 
    });

    socket.on('send-message', (data: { number: string, message: string }) => {
        console.log('Received send-message request');
        whatsappClientConnection.getInstance(io).sendMessage(data.number, data.message);
    });

    socket.on('get-whatsapp-status', () => {
        console.log('Received get-whatsapp-status request');
        const status = whatsappClientConnection.getInstance(io).getConnectionStatus();
        socket.emit('whatsapp-status-response', status);
    });

    socket.on('restart-whatsapp', async () => {
        console.log('Received restart-whatsapp request');
        try {
            const instance = whatsappClientConnection.getInstance(io);
            if (instance) {
                await instance.restartClient();
                socket.emit('whatsapp-restart-success', { message: 'WhatsApp client restart initiated' });
            } else {
                socket.emit('whatsapp-restart-error', { error: 'WhatsApp client not initialized' });
            }
        } catch (error: any) {
            console.error('Error restarting WhatsApp client:', error);
            socket.emit('whatsapp-restart-error', { error: error.message });
        }
    });
  });
}