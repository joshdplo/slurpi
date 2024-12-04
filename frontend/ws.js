const port = __WS_PORT__;
const socket = new WebSocket(`ws://localhost:${port}`);

// Connection opened
socket.addEventListener("open", (event) => {
  console.log('[ws] Connected');
});

// Connection error
socket.addEventListener("error", (event) => {
  console.log('[ws] Error', event);
});

// Closed
socket.addEventListener("close", (event) => {
  console.log('[ws] Connection Closed');
});

// Message
socket.addEventListener("message", (event) => {
  console.log("[ws] Server Message:", event.data);
});