import 'dotenv/config';
import { WebSocketServer } from 'ws';

/**
 * Websocket Server Setup
 */
const wss = new WebSocketServer({ port: process.env.WS_PORT });
wss.on('connection', function connection(ws) {
  // Send connection confirmation to client
  ws.send(JSON.stringify({ connected: true }));

  // On Client send 'message'
  ws.on('message', function message(data) {
    console.log('WS Message Received: %s', data);
  });

  // On Error
  ws.on('error', console.error);
});

/**
 * Send Message to client(s)
 */
export function sendMessage(json) {
  let str = JSON.stringify(json);

  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(str);
    }
  });
}