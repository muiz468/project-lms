const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

test('GET /health returns status ok', async () => {
  const server = app.listen(0); // port 0 = "pick any free port automatically"
  const { port } = server.address();

  const response = await fetch(`http://localhost:${port}/health`);
  const body = await response.json();

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.status, 'broken');

  server.close();
});