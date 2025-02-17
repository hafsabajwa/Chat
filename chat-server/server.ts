import WebSocket, { WebSocketServer } from 'ws';

interface MessageData {
  type: 'join' | 'leave' | 'chat';
  username: string;
  message?: string;
}

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected.');

  ws.on('message', (message: WebSocket.RawData) => {
    // Convert message to a string (in case it's a Buffer)
    const messageString = typeof message === 'string' ? message : message.toString();

    let data: MessageData;
    try {
      data = JSON.parse(messageString);
    } catch (e) {
      console.error('Invalid JSON', e);
      return;
    }

    // Create a payload to broadcast based on message type
    let payload: Record<string, any> = {};
    if (data.type === 'join') {
      payload = { type: 'notification', message: `${data.username} has joined the chat.` };
    } else if (data.type === 'leave') {
      payload = { type: 'notification', message: `${data.username} has left the chat.` };
    } else if (data.type === 'chat') {
      payload = { type: 'chat', username: data.username, message: data.message };
    }

    // Broadcast the payload to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(payload));
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected.');
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
