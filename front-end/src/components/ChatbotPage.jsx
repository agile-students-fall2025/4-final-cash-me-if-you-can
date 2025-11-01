import React, { useState } from 'react';
import './ChatbotPage.css';
import chatbotData from '../data/chatbotResponses.json';

function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: chatbotData.initialMessage.id,
      text: chatbotData.initialMessage.text,
      sender: chatbotData.initialMessage.sender,
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
      return chatbotData.responses.spending;
    } else if (input.includes('budget')) {
      return chatbotData.responses.budget;
    } else if (input.includes('save') || input.includes('saving')) {
      return chatbotData.responses.saving;
    } else if (input.includes('account')) {
      return chatbotData.responses.account;
    } else {
      return chatbotData.responses.default;
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
