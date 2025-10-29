import React, { useState } from 'react';
import './ChatbotPage.css';

function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your financial assistant. How can I help you today?",
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
    setInputText('');
    setIsLoading(true);


    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getBotResponse(inputText),
        sender: 'bot',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();


    if (input.includes('spending') || input.includes('expense')) {
      return "I can help you analyze your spending patterns. Based on your recent transactions, you've spent the most on dining and entertainment. Would you like a detailed breakdown?";
    } else if (input.includes('budget')) {
      return "Setting a budget is a great idea! I recommend the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. Would you like me to help you create a custom budget?";
    } else if (input.includes('save') || input.includes('saving')) {
      return "Saving money is important! Consider setting up automatic transfers to a savings account. Even small amounts add up over time. Would you like tips on how to save more?";
    } else if (input.includes('account')) {
      return "I can help you manage your accounts. You can view all your connected accounts, check balances, and see recent transactions. What would you like to know?";
    } else {
      return "I'm here to help with your financial questions! You can ask me about spending analysis, budgeting tips, savings strategies, or account management.";
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
