import React, { useState } from 'react';
import './ChatbotPage.css';
import { chatAPI } from '../services/api';

function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your personal finance assistant. I can help you with budgeting tips, track your spending, and answer financial questions. What would you like to know?",
      sender: 'bot',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      // Call backend API
      const response = await chatAPI.sendMessage(currentMessage);

      const botResponse = {
        id: Date.now() + 1,
        text: response.message,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        context: response.context_used,
        tool: response.tool_used
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please make sure the backend server is running.",
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="chatbot-page">
      <div className="chat-header">
        <h1>Financial Assistant</h1>
        <p>Ask me anything about your finances</p>
      </div>

      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender}`}
            >
              <div className="message-bubble">
                <p className="message-text">{message.text}</p>
                <span className="message-time">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message bot">
              <div className="message-bubble loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <form className="input-container" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="message-input"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="send-button"
            disabled={isLoading || !inputText.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatbotPage;
