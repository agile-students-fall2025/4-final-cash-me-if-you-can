const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');
const { initializeVectorStore } = require('./utils/vectorStore');

const plaidRoutes = require('./routes/plaid');
const chatRoutes = require('./routes/chat');
const transactionRoutes = require('./routes/transactions');
const dashboardRoutes = require('./routes/dashboard');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const accountRoutes = require('./routes/accounts');
const recurringTransactionRoutes = require('./routes/recurringTransactions');
const budgetRoutes = require('./routes/budgets');

// Connect to database and initialize vector store
connectDB().then(() => {
  // Initialize vector store with current MongoDB data after DB connection
  initializeVectorStore()
    .then(() => console.log('[vectorStore] Vector store initialized with MongoDB data'))
    .catch(err => console.error('[vectorStore] Vector store initialization failed:', err.message));
});

const app = express();

const allowedOrigins = [
  `${process.env.FRONTEND_URL}`,
  "http://localhost:3000"
];

app.use(cors({
  origin: allowedOrigins,
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
app.use('/api/accounts', accountRoutes);
app.use('/api/recurring-transactions', recurringTransactionRoutes);
app.use('/api/budgets', budgetRoutes);

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
