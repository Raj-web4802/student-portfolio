const express = require('express');

const app = express();
const router = express.Router();

// In-memory array for storing tasks
let tasks = [
  { id: 1, title: 'Learn Node.js and Express', completed: false },
  { id: 2, title: 'Build RESTful API with Middleware', completed: true }
];

// Step 3: Request logging middleware applied globally
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Supplementary Problem 1: Middleware to reject POST/PUT requests missing Content-Type: application/json
function validateContentType(req, res, next) {
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      return res.status(400).json({ error: 'Content-Type header must be application/json' });
    }
  }
  next();
}

app.use(validateContentType);
app.use(express.json());

// Supplementary Problem 2: Route-specific middleware to validate task ID format
function validateTaskId(req, res, next) {
  const taskId = parseInt(req.params.id, 10);
  if (isNaN(taskId) || taskId <= 0) {
    return res.status(400).json({ error: 'Invalid Task ID format. Must be a positive integer.' });
  }
  req.taskId = taskId;
  next();
}

// Step 4: Implement 4 CRUD routes
// 1. GET /tasks - Read all tasks
router.get('/tasks', (req, res) => {
  res.status(200).json({
    success: true,
    count: tasks.length,
    tasks: tasks
  });
});

// GET /tasks/:id - Read task by ID (Bonus helper endpoint)
router.get('/tasks/:id', validateTaskId, (req, res) => {
  const task = tasks.find((t) => t.id === req.taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.status(200).json({
    success: true,
    task: task
  });
});

// 2. POST /tasks - Create a new task
router.post('/tasks', (req, res) => {
  const { title, completed } = req.body || {};

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const newId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
  const newTask = {
    id: newId,
    title: title.trim(),
    completed: typeof completed === 'boolean' ? completed : false
  };

  tasks.push(newTask);
  res.status(201).json({
    message: 'Task created successfully',
    task: newTask
  });
});

// 3. PUT /tasks/:id - Update an existing task
router.put('/tasks/:id', validateTaskId, (req, res) => {
  const task = tasks.find((t) => t.id === req.taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, completed } = req.body || {};

  if (title === undefined && completed === undefined) {
    return res.status(400).json({ error: 'Please provide at least one field (title or completed) to update' });
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Task title must be a non-empty string' });
    }
    task.title = title.trim();
  }

  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be a boolean value' });
    }
    task.completed = completed;
  }

  res.status(200).json({
    message: 'Task updated successfully',
    task: task
  });
});

// 4. DELETE /tasks/:id - Delete a task by ID
router.delete('/tasks/:id', validateTaskId, (req, res) => {
  const taskIndex = tasks.findIndex((t) => t.id === req.taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
  res.status(200).json({
    message: 'Task deleted successfully',
    task: deletedTask
  });
});

// Mount router
app.use(router);

// Supplementary Problem 3: Custom 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Step 5: Global error handling middleware (must be last middleware)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = { app, tasks };
