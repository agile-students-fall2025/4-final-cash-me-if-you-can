import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatbotPage.css';
import { chatAPI } from '../services/api';

function ChatbotPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputText.trim()) return;

    if (!hasStartedChat) {
      setHasStartedChat(true);
    }

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

  const handleLogout = () => {
    navigate('/');
  };

  const handleLogoClick = () => {
    navigate('/chatbot');
    window.location.reload();
  };

  return (
    <div className="chatbot-page">
      <div className="chat-header">
        <div className="logo-container" onClick={handleLogoClick}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="logo-icon">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" />
            <path d="M2 17L12 22L22 17" />
            <path d="M2 12L12 17L22 12" />
          </svg>
          <span className="logo-text">cash me if you can</span>
        </div>
        <div className="header-content">
          <h1>Financial Assistant</h1>
          <p>Ask me anything about your finances</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className={`chat-container ${!hasStartedChat ? 'centered' : ''}`}>
        {!hasStartedChat && (
          <div className="welcome-message">
            <h2>Hi! I'm your personal finance assistant.</h2>
            <p>I can help you with budgeting tips, track your spending, and answer financial questions. What would you like to know?</p>
          </div>
        )}

        {hasStartedChat && (
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
        )}

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

      <div className="quick-actions">
        <button className="action-btn" onClick={() => navigate('/dashboard')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          <span>Dashboard</span>
        </button>

        <button className="action-btn" onClick={() => navigate('/connect')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <path d="M1 10h22" />
          </svg>
          <span>Connect Accounts</span>
        </button>

        <button className="action-btn" onClick={() => navigate('/categorize')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
          </svg>
          <span>Categorize</span>
        </button>

        <button className="action-btn" onClick={() => navigate('/settings')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
          </svg>
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}

export default ChatbotPage;
