const express = require('express');

const app = express();
const PORT = 5000;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

const tasks = [];
let nextId = 1;

app.get('/tasks', (req, res) => {
  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

app.post('/tasks', (req, res) => {
  const { title, completed = false } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Title is required',
    });
  }

  const task = {
    id: nextId++,
    title: title.trim(),
    completed,
  };

  tasks.push(task);

  res.status(201).json({
    success: true,
    data: task,
  });
});

app.put('/tasks/:id', (req, res) => {
  const taskId = Number(req.params.id);
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found',
    });
  }

  const { title, completed } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Title must be a non-empty string',
      });
    }
    task.title = title.trim();
  }

  if (completed !== undefined) {
    task.completed = Boolean(completed);
  }

  res.status(200).json({
    success: true,
    data: task,
  });
});

app.delete('/tasks/:id', (req, res) => {
  const taskId = Number(req.params.id);
  const taskIndex = tasks.findIndex((item) => item.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Task not found',
    });
  }

  tasks.splice(taskIndex, 1);

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
  });
});

app.get('/error-demo', (req, res, next) => {
  next(new Error('Deliberate error for middleware demo'));
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Something went wrong',
  });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
