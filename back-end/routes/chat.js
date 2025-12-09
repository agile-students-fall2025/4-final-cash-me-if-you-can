const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/authMiddleware');

// Send message to chatbot (requires authentication)
router.post('/message', auth, chatController.sendMessage);

// Get all conversations for history sidebar (requires authentication)
router.get('/conversations', auth, chatController.getConversations);

// Get a specific conversation by ID (requires authentication)
router.get('/conversations/:conversationId', auth, chatController.getConversation);

// Delete a specific conversation (requires authentication)
router.delete('/conversations/:conversationId', auth, chatController.deleteConversation);

// Get conversation history - legacy endpoint (requires authentication)
router.get('/history', auth, chatController.getHistory);

// Clear all conversation history (requires authentication)
router.post('/clear', auth, chatController.clearHistory);

module.exports = router;
