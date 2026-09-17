const test = require('node:test');
const assert = require('node:assert/strict');
const { app, tasks } = require('./server');

function startTestServer() {
  return app.listen(0);
}

test('GET /tasks - returns all tasks', { concurrency: false }, async () => {
  const server = startTestServer();
  const port = await new Promise((resolve) => server.once('listening', () => resolve(server.address().port)));

  try {
    const response = await fetch(`http://127.0.0.1:${port}/tasks`);
    assert.equal(response.status, 200);

    const body = await response.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.tasks));
    assert.equal(body.count, body.tasks.length);
  } finally {
    server.close();
  }
});

test('GET /tasks/:id - returns task by ID if exists', { concurrency: false }, async () => {
  const server = startTestServer();
  const port = await new Promise((resolve) => server.once('listening', () => resolve(server.address().port)));

  try {
    const response = await fetch(`http://127.0.0.1:${port}/tasks/1`);
    assert.equal(response.status, 200);

    const body = await response.json();
    assert.equal(body.success, true);
    assert.equal(body.task.id, 1);
  } finally {
    server.close();
  }
});

test('GET /tasks/:id - returns 404 for non-existent task', { concurrency: false }, async () => {
  const server = startTestServer();
  const port = await new Promise((resolve) => server.once('listening', () => resolve(server.address().port)));

  try {
    const response = await fetch(`http://127.0.0.1:${port}/tasks/9999`);
    assert.equal(response.status, 404);

    const body = await response.json();
    assert.equal(body.error, 'Task not found');
  } finally {
    server.close();
  }
});

test('GET /tasks/:id - returns 400 for invalid task ID format', { concurrency: false }, async () => {
  const server = startTestServer();
  const port = await new Promise((resolve) => server.once('listening', () => resolve(server.address().port)));

  try {
    const response = await fetch(`http://127.0.0.1:${port}/tasks/abc`);
    assert.equal(response.status, 400);

    const body = await response.json();
    assert.equal(body.error, 'Invalid Task ID format. Must be a positive integer.');
  } finally {
    server.close();
  }
});

test('POST /tasks - creates a new task with Content-Type: application/json', { concurrency: false }, async () => {
  const server = startTestServer();
  const port = await new Promise((resolve) => server.once('listening', () => resolve(server.address().port)));

  try {
    const response = await fetch(`http://127.0.0.1:${port}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Test Task', completed: false })
    });

    assert.equal(response.status, 201);
    const body = await response.json();
    assert.equal(body.message, 'Task created successfully');
    assert.equal(body.task.title, 'New Test Task');
    assert.equal(body.task.completed, false);
    assert.ok(typeof body.task.id === 'number');
  } finally {
    server.close();
  }
});

test('POST /tasks - returns 400 when Content-Type header is missing', { concurrency: false }, async () => {
  const server = startTestServer();
  const port = await new Promise((resolve) => server.once('listening', () => resolve(server.address().port)));

  try {
    const response = await fetch(`http://127.0.0.1:${port}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ title: 'No Content-Type Task' })
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error, 'Content-Type header must be application/json');
  } finally {
    server.close();
  }
});

test('POST /tasks - returns 400 when title is missing', { concurrency: false }, async () => {
  const server = startTestServer();
  const port = await new Promise((resolve) => server.once('listening', () => resolve(server.address().port)));

  try {
    const response = await fetch(`http://127.0.0.1:${port}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true })
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error, 'Task title is required');
  } finally {
    server.close();
  }
});

test('PUT /tasks/:id - updates existing task', { concurrency: false }, async () => {
  const server = startTestServer();
  const port = await new Promise((resolve) => server.once('listening', () => resolve(server.address().port)));

  try {
    const response = await fetch(`http://127.0.0.1:${port}/tasks/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true })
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.message, 'Task updated successfully');
    assert.equal(body.task.id, 1);
    assert.equal(body.task.completed, true);
  } finally {
    server.close();
  }
});

test('DELETE /tasks/:id - deletes existing task', { concurrency: false }, async () => {
  const server = startTestServer();
  const port = await new Promise((resolve) => server.once('listening', () => resolve(server.address().port)));

  try {
    const response = await fetch(`http://127.0.0.1:${port}/tasks/2`, {
      method: 'DELETE'
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.message, 'Task deleted successfully');
    assert.equal(body.task.id, 2);
  } finally {
    server.close();
  }
});

test('Returns 404 structured JSON for undefined routes', { concurrency: false }, async () => {
  const server = startTestServer();
  const port = await new Promise((resolve) => server.once('listening', () => resolve(server.address().port)));

  try {
    const response = await fetch(`http://127.0.0.1:${port}/undefined-route`);
    assert.equal(response.status, 404);
    const body = await response.json();
    assert.equal(body.error, 'Route not found');
  } finally {
    server.close();
  }
});
