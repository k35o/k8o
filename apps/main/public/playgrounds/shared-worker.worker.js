const STARTED_AT = Date.now();
let count = 0;
const ports = new Set();

const broadcast = (message) => {
  for (const p of ports) {
    p.postMessage(message);
  }
};

self.addEventListener('connect', (event) => {
  const port = event.ports[0];
  ports.add(port);

  port.postMessage({
    type: 'init',
    startedAt: STARTED_AT,
    count,
    connections: ports.size,
  });
  broadcast({ type: 'connections', connections: ports.size });

  port.addEventListener('message', (msg) => {
    const data = msg.data;
    if (data && data.type === 'increment') {
      count += 1;
      broadcast({ type: 'count', count });
      return;
    }
    if (data && data.type === 'disconnect') {
      ports.delete(port);
      broadcast({ type: 'connections', connections: ports.size });
    }
  });

  port.start();
});
