import WebSocket, { WebSocketServer } from 'ws';
//import "./style.css"

interface MessageData {
  type: 'join' | 'leave' | 'chat' | 'edit' | 'delete';
  username: string;
  message?: string;
  messageId?: string;
}

const wss = new WebSocketServer({ port: 8080 });
const activeUsers = new Set<string>();
const wsUserMap = new Map<WebSocket, string>();

const broadcastActiveUsers = () => {
  const users = Array.from(activeUsers);
  const payload = { type: 'activeUsers', users };
  console.log("Broadcasting active users:", users);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });
};

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
      wsUserMap.set(ws, data.username);
      activeUsers.add(data.username);
      broadcastActiveUsers();
      payload = { type: 'notification', message: `${data.username} has joined the chat.` };
    } else if (data.type === 'leave') {
      activeUsers.delete(data.username);
      wsUserMap.delete(ws);
      broadcastActiveUsers();
      payload = { type: 'notification', message: `${data.username} has left the chat.` };
    } else if (data.type === 'chat') {
      payload = { type: 'chat', username: data.username, message: data.message, messageId: data.messageId };
    } else if (data.type === 'edit') {
      console.log(`Editing message ${data.messageId} from ${data.username}`);
      payload = { type: 'edit', username: data.username, message: data.message, messageId: data.messageId };
    } else if (data.type === 'delete') {
      console.log(`Deleting message ${data.messageId} from ${data.username}`);
      payload = { type: 'delete', username: data.username, messageId: data.messageId };
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
    const username = wsUserMap.get(ws);
    if (username) {
      activeUsers.delete(username);
      wsUserMap.delete(ws);
      broadcastActiveUsers();
    }
    console.log('Client disconnected.');
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
