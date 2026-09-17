const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { app, Task, signToken } = require('./server');

function startTestServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

test('Task schema requires an owner and applies defaults', async () => {
  const task = new Task({
    owner: new mongoose.Types.ObjectId(),
    title: '  Authenticated task  '
  });
  await task.validate();

  assert.equal(task.title, 'Authenticated task');
  assert.equal(task.completed, false);
  assert.equal(task.priority, 'medium');
  assert.ok(task.createdAt instanceof Date);
});

test('Task schema rejects a missing owner', async () => {
  const task = new Task({ title: 'Unowned task' });

  await assert.rejects(task.validate(), (error) => {
    assert.equal(error.name, 'ValidationError');
    assert.ok(error.errors.owner);
    return true;
  });
});

test('Passwords are bcrypt hashes and compare correctly', async () => {
  const password = 'correct horse battery staple';
  const hash = await bcrypt.hash(password, 12);

  assert.notEqual(hash, password);
  assert.equal(await bcrypt.compare(password, hash), true);
  assert.equal(await bcrypt.compare('wrong password', hash), false);
});

test('JWT contains the user identity and expires in one hour', () => {
  const token = signToken({ _id: new mongoose.Types.ObjectId(), email: 'user@example.com' });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  assert.equal(decoded.email, 'user@example.com');
  assert.ok(decoded.exp - decoded.iat <= 3600);
});

test('Protected task routes reject missing authentication', async () => {
  const server = await startTestServer();
  const port = server.address().port;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/tasks`);
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
      error: 'Authentication required. Use Bearer <token>.'
    });
  } finally {
    server.close();
  }
});

test('Protected task routes reject invalid authentication', async () => {
  const server = await startTestServer();
  const port = server.address().port;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/tasks`, {
      headers: { Authorization: 'Bearer invalid.token.value' }
    });
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: 'Invalid authentication token.' });
  } finally {
    server.close();
  }
});

test('Register validates short passwords before database access', async () => {
  const server = await startTestServer();
  const port = server.address().port;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@example.com', password: 'short' })
    });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'Password must be at least 8 characters.' });
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
