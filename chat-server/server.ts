import WebSocket, { WebSocketServer } from 'ws';

interface MessageData {
  type: 'join' | 'leave' | 'chat' | 'edit';
  username: string;
  message?: string;
  messageId?: string;
}

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected.');

  ws.on('message', (message: WebSocket.RawData) => {
    const messageString = typeof message === 'string' ? message : message.toString();

    let data: MessageData;
    try {
      data = JSON.parse(messageString);
    } catch (e) {
      console.error('Invalid JSON', e);
      return;
    }

    let payload: Record<string, any> = {};

    if (data.type === 'join') {
      payload = { type: 'notification', message: `${data.username} has joined the chat.` };
    } else if (data.type === 'leave') {
      payload = { type: 'notification', message: `${data.username} has left the chat.` };
    } else if (data.type === 'chat') {
      payload = { type: 'chat', username: data.username, message: data.message, messageId: data.messageId };
    } else if (data.type === 'edit') {
      console.log(`Editing message ${data.messageId} from ${data.username}`);
      payload = { type: 'edit', username: data.username, message: data.message, messageId: data.messageId };
    }

    if (Object.keys(payload).length) {
      console.log("Broadcasting payload:", payload);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(payload));
        }
      });
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected.');
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
