import React, { useState, useEffect, useRef } from 'react';
import '../styles/Chat.css';
import { FaPaperPlane } from 'react-icons/fa';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChatEnded, setIsChatEnded] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const sentSound = new Audio('/assets/sounds/new-notification-09-352705.mp3');
  const receivedSound = new Audio('/assets/sounds/notification-sound-effect-372475.mp3');

  const BACKEND_URL =
    process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    setMessages([
      {
        text: 'Olá! 👋 Sou a Gaby, assistente virtual da Gabrielly Semijoias. 💎 Como posso te ajudar hoje?',
        sender: 'bot',
      }
    ]);
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const playSentSound = () => {
    sentSound.play().catch(error => console.error("Erro ao tocar som de envio:", error));
  };

  const playReceivedSound = () => {
    receivedSound.play().catch(error => console.error("Erro ao tocar som de recebimento:", error));
  };

  const handleOptionClick = (option) => {
    if (option.includes('Encerrar')) {
      setIsChatEnded(true);
      const endMessage = 'Atendimento encerrado. 😊 Obrigado por conversar comigo!';
      setMessages(prev => [
        ...prev,
        { text: '❌ Encerrar atendimento', sender: 'user' },
        { text: endMessage, sender: 'bot' }
      ]);
    } else if (option.includes('atendente')) {
      handleWhatsAppRedirect();
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    playSentSound();
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(1).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, history }),
      });

      const data = await response.json();
      const botMessage = {
        text: data.reply || 'Desculpe, não consegui entender sua mensagem.',
        sender: 'bot',
      };
      setMessages(prev => [...prev, botMessage]);
      playReceivedSound();
    } catch (error) {
      console.error('Erro ao conectar com o chatbot:', error);
      setMessages(prev => [
        ...prev,
        {
          text: 'Desculpe, ocorreu um problema na comunicação. Você pode tentar novamente ou falar direto com nosso atendimento no WhatsApp. 😊',
          sender: 'bot',
        }
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleWhatsAppRedirect = () => {
    const phoneNumber = '5583981673349';
    const message = encodeURIComponent(
      'Olá! Gostaria de atendimento com um humano. 😊'
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const renderMessageText = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a>;
      }
      return part;
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">💎 Gabrielly Semijoias - Assistente</div>

      <div className="message-list">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            {msg.sender === 'bot' && <span className="message-icon">🤖</span>}
            <div className="message-bubble">
              {renderMessageText(msg.text)}
            </div>
            {msg.sender === 'user' && <span className="message-status">✓✓</span>}
          </div>
        ))}

        <div ref={messagesEndRef} />

        {isLoading && (
          <div className="loading-message">
            Digitando<span className="loading-dot">...</span>
          </div>
        )}
      </div>

      <div className="chat-actions">
        <button onClick={() => handleOptionClick('👩‍💻 Falar com atendente humano')} disabled={isChatEnded}>
          👩‍💻 Falar com atendente
        </button>
        <button onClick={() => handleOptionClick('❌ Encerrar atendimento')} disabled={isChatEnded}>
          ❌ Encerrar
        </button>
      </div>

      <div className="input-area">
        <input
          ref={inputRef}
          type="text"
          value={input}
          placeholder="Digite uma mensagem..."
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading || isChatEnded}
        />
        <button onClick={handleSend} disabled={!input.trim() || isLoading || isChatEnded}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}

export default Chat;
