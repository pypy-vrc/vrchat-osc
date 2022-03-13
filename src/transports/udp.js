const dgram = require('dgram');
const {EventEmitter} = require('stream');

const event = new EventEmitter();

const socket = dgram.createSocket({
  type: 'udp4',
  reuseAddr: true
});

function send(msg, port = 9000, address = '127.0.0.1') {
  return new Promise((resolve, reject) => {
    socket.send(msg, port, address, (err) => {
      if (err !== null) {
        console.error(new Date(), 'udp', err);
        reject(err);
        return;
      }
      resolve();
    });
  });
}

socket.on('error', (err) => {
  console.error(new Date(), 'udp', err);
});

socket.on('message', (msg) => {
  try {
    event.emit('data', msg);
  } catch (err) {
    console.error(new Date(), 'udp', err);
    console.log(msg.toString('hex'));
  }
});

socket.bind(9001, '127.0.0.1', async () => {
  console.log(new Date(), 'udp', socket.address());
});

module.exports = {
  event,
  send
};
