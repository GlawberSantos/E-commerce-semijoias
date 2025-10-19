/* ChatbotWidget.js */
import React, { useState } from 'react';
import Chat from '../components/Chat';
import '../styles/ChatbotWidget.css';

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="chatbot-widget-container">
      {isOpen && (
        <div className="chatbot-box" role="dialog" aria-label="Janela de chat">
          <Chat />
        </div>
      )}
      <button
        className="chatbot-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Fechar chat' : 'Abrir chat'}
      >
        {isOpen ? '❌' : '💬'}
      </button>
    </div>
  );
}
export default ChatbotWidget;