const fs = require('fs');
const https = require('https');
const {EventEmitter} = require('stream');
const {WebSocketServer} = require('ws');

const event = new EventEmitter();

const server = new https.createServer({
  ca: fs.readFileSync('storage/fullchain.pem'),
  cert: fs.readFileSync('storage/cert.pem'),
  key: fs.readFileSync('storage/privkey.pem')
});

const wss = new WebSocketServer({
  server
});

setInterval(() => {
  for (const ws of wss.clients) {
    ws.ping();
  }
}, 30000); // 30s

server.on('error', (err) => {
  console.error(new Date(), 'socket error', err);
});

wss.on('connection', (ws, req) => {
  console.log(new Date(), 'ws', req.socket.remoteAddress);
  req.socket.setNoDelay(true);

  ws.on('message', function (msg) {
    try {
      const data = JSON.parse(msg.toString());
      event.emit('data', data);
    } catch (err) {
      console.error(new Date(), 'ws', err);
      this.terminate();
    }
  });

  ws.ping();
});

server.listen(6974, '0.0.0.0', () => {
  console.log(new Date(), 'ws', server.address());
});

module.exports = {
  event
};
