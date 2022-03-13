const osc = require('./osc');
const {udp, ws} = require('./transports');
const {sleep} = require('./util');

let lastHeartRate = 0;

(async function () {
  let value = -1;

  for (;;) {
    await sleep(500);

    if (lastHeartRate === value) {
      continue;
    }

    value = lastHeartRate;
    const v = Math.max(0, Math.min(200, lastHeartRate)) / 200;
    await udp.send(
      osc.message('/avatar/parameters/Counter', osc.OscFloat32.from(v))
    );
  }
})();

udp.event.on('data', (data) => {
  console.log(new Date(), 'udp', data);

  for (const message of osc.parse(data)) {
    console.log(message);
  }
});

ws.event.on('data', (data) => {
  console.log(new Date(), 'ws', data);

  switch (data.cmd) {
    case 'heartrate':
      lastHeartRate = data.value;
      break;
  }
});

setTimeout(async () => {
  // await send(
  //   osc.message('/oscillator/4/frequency', osc.OscFloat32.from(440.0))
  // );
  // await send(osc.message('/foo', 1000, -1, 'hello', 1.234, 5.678));
  // await send(osc.message('/f1', osc.OscFloat32.from(100.0)));
  // await send(osc.message('/f2', 43));
  // for (let n = 0; n < 10000; ++n) {
  //   await send(
  //     osc.bundle(
  //       osc.message('/f1', n),
  //       osc.message('/f2', 0, n, n),
  //       osc.message('/f3', 0, n, n, n),
  //       osc.message('/f4', 0, n, n, n, n)
  //     )
  //   );
  // }
  // console.log(
  //   osc.parse(
  //     osc.bundle(
  //       osc.message('/oscillator/4/frequency', osc.OscFloat32.from(440.0)),
  //       osc.message('/foo', 1000, -1, 'hello', 1.234, 5.678),
  //       osc.message('/f1', osc.OscFloat32.from(100.0)),
  //       osc.message('/f2', 43)
  //     )
  //   )
  // );
  // for (;;) {
  //   await send(
  //     osc.message('/avatar/parameters/VRCEmote', Math.floor(Math.random() * 8))
  //   );
  //   await sleep(3000);
  //   if (Date.now() === 0) {
  //     break;
  //   }
  // }
  // await send(osc.message('/input/Jump', 0));
  // await sleep(100);
  // await send(osc.message('/input/Jump', 1));
  // await sleep(100);
  // await send(osc.message('/input/Jump', 0));
  // // int32, float32 or bool only
  // await send(osc.message('/avatar/parameters/VRCEmote', 0));
  // await send(osc.message('/avatar/parameters/Coat', true));
}, 1000);
