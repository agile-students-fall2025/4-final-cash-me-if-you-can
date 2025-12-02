const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');

const plaidRoutes = require('./routes/plaid');
const chatRoutes = require('./routes/chat');
const transactionRoutes = require('./routes/transactions');
const dashboardRoutes = require('./routes/dashboard');
<<<<<<< HEAD
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const { connectDB } = require('./config/database');
=======

connectDB();
>>>>>>> main

connectDB();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/plaid', plaidRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Cash Me Backend API is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Cash Me API' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
