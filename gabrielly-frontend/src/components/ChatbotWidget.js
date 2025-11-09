import React, { useState } from 'react';
import Chat from './Chat';
import '../styles/ChatbotWidget.css';

export default function ChatBotWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="chatbot-widget">
      {isOpen && (
        <div className="chatbot-window">
          <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
            ✕
          </button>
          <Chat />
        </div>
      )}
      {!isOpen && (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}
    </div>
  );
}
