import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import './ChatbotPage.css';
import { chatAPI } from '../services/api';
import DiamondLogo from './icons/DiamondLogo';

function ChatbotPage({ onMenuOpen }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Quick action buttons configuration
  const quickActions = [
    { id: 'dashboard', icon: 'chart', label: 'Dashboard', route: '/dashboard', color: 'purple' },
    { id: 'networth', icon: 'dollar', label: 'Net Worth', route: '/networth', color: 'teal' },
    { id: 'transactions', icon: 'list', label: 'Transactions', route: '/categorize', color: 'cyan' },
    { id: 'recurring', icon: 'recurring', label: 'Recurring', route: '/recurring', color: 'purple' },
    { id: 'connect', icon: 'card', label: 'Manage Accounts', route: '/connect', color: 'teal' },
    { id: 'settings', icon: 'settings', label: 'Settings', route: '/settings', color: 'cyan' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check for onboarding suggested query
  useEffect(() => {
    const suggestedQuery = localStorage.getItem('onboarding_suggested_query');
    if (suggestedQuery && location.pathname === '/chatbot') {
      // Clear it immediately to prevent re-triggering
      localStorage.removeItem('onboarding_suggested_query');

      // Set the input text
      setInputText(suggestedQuery);

      // Auto-send the message after a brief delay
      setTimeout(async () => {
        if (!suggestedQuery.trim()) return;

        // Transition to chat mode on first message
        setHasStartedChat(true);

        const userMessage = {
          id: Date.now(),
          text: suggestedQuery,
          sender: 'user',
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
          const response = await chatAPI.sendMessage(suggestedQuery);
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
          console.error('Error:', error);
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            text: "Sorry, I'm having trouble connecting. Please try again.",
            sender: 'bot',
            timestamp: new Date().toISOString()
          }]);
        } finally {
          setIsLoading(false);
        }
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Run when navigating to chatbot page

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Transition to chat mode on first message
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
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting. Please try again.",
        sender: 'bot',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (route) => {
    navigate(route);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Render icon based on type
  const renderActionIcon = (iconType) => {
    switch(iconType) {
      case 'chart':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        );
      case 'dollar':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v12M8 9h8M8 15h8" />
          </svg>
        );
      case 'list':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
        );
      case 'recurring':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
        );
      case 'card':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <path d="M1 10h22" />
          </svg>
        );
      case 'settings':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v10M3.93 3.93l4.24 4.24m8.48 0l4.24-4.24M1 12h6m6 0h10M3.93 20.07l4.24-4.24m8.48 0l4.24 4.24" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`chatbot-page ${hasStartedChat ? 'chat-active' : 'landing'}`}>
      {/* Diamond Logo - Top Left when chat active */}
      {hasStartedChat && (
        <div
          className="diamond-logo-container corner"
          onClick={onMenuOpen}
          title="Open Menu"
        >
          <DiamondLogo size={80} className="diamond-logo" />
          <span className="menu-tooltip">Menu</span>
        </div>
      )}

      {/* Landing State Layout */}
      {!hasStartedChat && (
        <div className="landing-container">
          <div
            className="diamond-logo-container centered"
            onClick={onMenuOpen}
            title="Open Menu"
          >
            <DiamondLogo size={200} className="diamond-logo" />
            <h1 className="brand-title">CLARITY AI</h1>
          </div>
          <div className="input-row">
            <form
              className="landing-input-form"
              onSubmit={handleSendMessage}
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask me anything about your finances..."
                className="landing-input"
              />
              <button type="submit" className="landing-send-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </form>

            <div className="quick-actions">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  className={`quick-action-btn ${action.color}`}
                  onClick={() => handleQuickAction(action.route)}
                >
                  <span className="action-icon">{renderActionIcon(action.icon)}</span>
                  <span className="action-label">{action.label}</span>
                </button>
              ))}
            </div>
            <p className="chat-disclosure">
              We might send your transactiona and spending records to OpenAI to generate a comprehensive response. We will not send any personal information.
            </p>
          </div>
        </div>
      )}

      {/* Active Chat Layout */}
      {hasStartedChat && (
        <div className="chat-container">
          <div className="messages-container">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-bubble">
                  <div className="message-text">
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="message-bubble loading">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-container" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="chat-input"
              disabled={isLoading}
            />
            <button type="submit" className="send-button" disabled={isLoading || !inputText.trim()}>
              Send
            </button>
          </form>
          <p className="chat-disclosure">
            We might send your transactiona and spending records to OpenAI to generate a comprehensive response. We will not send any personal information.
          </p>

          <div className="chat-quick-actions">
            {quickActions.map((action) => (
              <button
                key={action.id}
                className={`quick-action-btn ${action.color}`}
                onClick={() => handleQuickAction(action.route)}
              >
                <span className="action-icon">{renderActionIcon(action.icon)}</span>
                <span className="action-label">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatbotPage;
