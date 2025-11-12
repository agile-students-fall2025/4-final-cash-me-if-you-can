const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Send message to chatbot
router.post('/message', chatController.sendMessage);

// Get conversation history
router.get('/history', chatController.getHistory);

// Clear conversation history
router.post('/clear', chatController.clearHistory);

module.exports = router;
