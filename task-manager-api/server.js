const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Task = require('./models/Task');

dotenv.config();

const app = express();
const router = express.Router();

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

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

function validateTaskId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid Task ID format.' });
  }
  next();
}

router.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
});

router.get('/tasks/:id', validateTaskId, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ success: true, task });
  } catch (error) {
    next(error);
  }
});

router.post('/tasks', async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    next(error);
  }
});

router.put('/tasks/:id', validateTaskId, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task updated successfully', task });
  } catch (error) {
    next(error);
  }
});

router.delete('/tasks/:id', validateTaskId, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully', task });
  } catch (error) {
    next(error);
  }
});

app.use(router);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err);

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((validationError) => ({
      field: validationError.path,
      message: validationError.message
    }));
    return res.status(400).json({ error: 'Validation failed', details });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid value supplied for a task field' });
  }

  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;

async function connectDatabase(uri = process.env.MONGO_URI) {
  if (!uri) {
    throw new Error('MONGO_URI is not configured. Copy .env.example to .env and set the connection string.');
  }
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

if (require.main === module) {
  connectDatabase()
    .then(() => {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((error) => {
      console.error('MongoDB connection failed:', error.message);
      process.exitCode = 1;
    });
}

module.exports = { app, connectDatabase, Task };
