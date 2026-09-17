const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Task = require('./models/Task');
const User = require('./models/User');
const { requireAuth } = require('./middleware/auth');

dotenv.config();

const app = express();
const router = express.Router();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174'
  ]
}));

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

function validateCredentials(req, res, next) {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }
  next();
}

function validateTaskInput(req, res, next) {
  const { title, description, priority } = req.body || {};
  if (req.method === 'POST' && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({ error: 'Task title is required.' });
  }
  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({ error: 'Task title must be a non-empty string.' });
  }
  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({ error: 'Description must be a string.' });
  }
  if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
    return res.status(400).json({ error: 'Priority must be low, medium, or high.' });
  }
  next();
}

function validateTaskId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid Task ID format.' });
  }
  next();
}

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }
  return jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

function publicUser(user) {
  return { id: user._id, email: user.email, createdAt: user.createdAt };
}

app.use(validateContentType);
app.use(express.json());

router.post('/auth/register', validateCredentials, async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    const password = await bcrypt.hash(req.body.password, 12);
    const user = await User.create({ email, password });
    res.status(201).json({ message: 'Registration successful.', user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post('/auth/login', validateCredentials, async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const user = await User.findOne({ email });
    const passwordMatches = user && await bcrypt.compare(req.body.password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    res.status(200).json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }
    res.status(200).json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.get('/tasks', requireAuth, async (req, res, next) => {
  try {
    const tasks = await Task.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
});

router.get('/tasks/:id', requireAuth, validateTaskId, async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ success: true, task });
  } catch (error) {
    next(error);
  }
});

router.post('/tasks', requireAuth, validateTaskInput, async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, owner: req.user.id });
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    next(error);
  }
});

router.put('/tasks/:id', requireAuth, validateTaskId, validateTaskInput, async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { title, description, completed, priority },
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(200).json({ message: 'Task updated successfully', task });
  } catch (error) {
    next(error);
  }
});

router.delete('/tasks/:id', requireAuth, validateTaskId, async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
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

app.use((err, req, res, _next) => {
  console.error(err.stack || err);

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((validationError) => ({
      field: validationError.path,
      message: validationError.message
    }));
    return res.status(400).json({ error: 'Validation failed', details });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
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

module.exports = { app, connectDatabase, Task, User, signToken };
