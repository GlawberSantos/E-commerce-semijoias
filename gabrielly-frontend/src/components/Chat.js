import React, { useState, useEffect } from 'react';
import '../styles/Chat.css';
import { FaPaperPlane } from 'react-icons/fa';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const BACKEND_URL =
    process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    setMessages([
      {
                  text: 'Olá! 👋 Sou a Gaby, assistente virtual da Gabrielly Semijoias. 💎 Como posso te ajudar hoje?',
                  sender: 'bot',
                  options: [
                    '❌ Encerrar atendimento',
                    '👩‍💻 Falar com atendente humano'
                  ]      }
    ]);
  }, []);

  const handleOptionClick = (option) => {
    if (option.includes('Continuar')) {
      setMessages(prev => [...prev, { text: option, sender: 'user' }]);
    } else if (option.includes('Encerrar')) {
      setMessages(prev => [
        ...prev,
        { text: option, sender: 'user' },
        { text: 'Atendimento encerrado. 😊 Obrigado por conversar comigo!', sender: 'bot' }
      ]);
    } else if (option.includes('atendente')) {
      handleWhatsAppRedirect();
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
      });

      const data = await response.json();
      const botMessage = {
        text: data.reply || 'Desculpe, não consegui entender sua mensagem.',
        sender: 'bot',
        options: [
          '💬 Continuar conversa',
          '❌ Encerrar atendimento',
          '👩‍💻 Falar com atendente humano'
        ]
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Erro ao conectar com o chatbot:', error);
      setMessages(prev => [
        ...prev,
        {
          text: 'Desculpe, ocorreu um problema na comunicação. Você pode tentar novamente ou falar direto com nosso atendimento no WhatsApp. 😊',
          sender: 'bot',
          options: ['👩‍💻 Falar com atendente humano']
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const phoneNumber = '5583981673349';
    const message = encodeURIComponent(
      'Olá! Gostaria de atendimento com um humano. 😊'
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">💎 Gabrielly Semijoias - Assistente</div>

      <div className="message-list">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            {msg.sender === 'bot' && <span className="message-icon">🤖</span>}
            <div className="message-bubble">
              {msg.text}
              {msg.options && (
                <div className="options">
                  {msg.options.map((opt, j) => (
                    <button key={j} className="option-btn" onClick={() => handleOptionClick(opt)}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {msg.sender === 'user' && <span className="message-status">✓✓</span>}
          </div>
        ))}

        {isLoading && (
          <div className="loading-message">
            Digitando<span className="loading-dot">...</span>
          </div>
        )}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          placeholder="Digite uma mensagem..."
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={!input.trim() || isLoading}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}

export default Chat;
