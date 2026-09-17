const test = require('node:test');
const assert = require('node:assert/strict');
const { app, Task } = require('./server');

function startTestServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

test('Task schema applies defaults and trims the title', async () => {
  const task = new Task({ title: '  Learn MongoDB  ' });
  await task.validate();

  assert.equal(task.title, 'Learn MongoDB');
  assert.equal(task.description, '');
  assert.equal(task.completed, false);
  assert.equal(task.priority, 'medium');
  assert.ok(task.createdAt instanceof Date);
});

test('Task schema rejects a missing title', async () => {
  const task = new Task();

  await assert.rejects(task.validate(), (error) => {
    assert.equal(error.name, 'ValidationError');
    assert.ok(error.errors.title);
    return true;
  });
});

test('Task schema rejects an invalid priority', async () => {
  const task = new Task({ title: 'Invalid priority', priority: 'urgent' });

  await assert.rejects(task.validate(), (error) => {
    assert.equal(error.name, 'ValidationError');
    assert.ok(error.errors.priority);
    return true;
  });
});

test('POST /tasks rejects a missing JSON Content-Type header', async () => {
  const server = await startTestServer();
  const port = server.address().port;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ title: 'No header' })
    });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      error: 'Content-Type header must be application/json'
    });
  } finally {
    server.close();
  }
});

test('GET /tasks/:id rejects an invalid MongoDB ID', async () => {
  const server = await startTestServer();
  const port = server.address().port;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/tasks/not-an-object-id`);
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'Invalid Task ID format.' });
  } finally {
    server.close();
  }
});

test('Returns structured JSON for undefined routes', async () => {
  const server = await startTestServer();
  const port = server.address().port;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/undefined-route`);
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: 'Route not found' });
  } finally {
    server.close();
  }
});
