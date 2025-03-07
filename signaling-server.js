const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let users = [];

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'join') {
      // Adiciona o usuário à lista
      users.push({ id: data.id, ws });
      broadcastUserCount();
    } else if (data.type === 'signal') {
      // Encaminha o sinal para todos os outros usuários
      users.forEach((user) => {
        if (user.id !== data.id && user.ws.readyState === WebSocket.OPEN) {
          user.ws.send(JSON.stringify({ type: 'signal', data: data.data }));
        }
      });
    }
  });

  ws.on('close', () => {
    // Remove o usuário da lista
    users = users.filter((user) => user.ws !== ws);
    broadcastUserCount();
  });
});

// Envia o contador de usuários para todos
function broadcastUserCount() {
  const userCount = users.length;
  users.forEach((user) => {
    if (user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(JSON.stringify({ type: 'userCount', data: userCount }));
    }
  });
}