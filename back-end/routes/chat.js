const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/authMiddleware');

// Send message to chatbot (requires authentication)
router.post('/message', auth, chatController.sendMessage);

// Get conversation history (requires authentication)
router.get('/history', auth, chatController.getHistory);

// Clear conversation history (requires authentication)
router.post('/clear', auth, chatController.clearHistory);

module.exports = router;
