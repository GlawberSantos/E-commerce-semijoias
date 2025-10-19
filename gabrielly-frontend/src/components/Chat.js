/* Chat.js */
import React, { useState, useEffect } from 'react';
import '../styles/Chat.css';
import { FaPaperPlane } from 'react-icons/fa';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // URL do backend - NÃO precisa de /api no final aqui
  const BACKEND_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    setMessages([
      {
        text: 'Olá! 👋 Sou a assistente da Gabrielly Semijoias. Como posso ajudar você hoje?',
        sender: 'bot'
      }
    ]);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) {
      setError('Por favor, digite uma mensagem antes de enviar.');
      return;
    }

    const userMessage = { text: input, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Envia para o BACKEND em /chat (não /api/chat)
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput // O backend espera { message: "..." }
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: Falha na comunicação com o servidor.`);
      }

      const data = await response.json();

      const botMessage = {
        text: data.reply || 'Desculpe, não consegui processar sua mensagem.',
        sender: 'bot'
      };

      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      const errorMsg = `Erro: ${error.message}. Verifique se o servidor está rodando.`;
      setError(errorMsg);
      console.error('Erro ao conectar com o chatbot:', error);

      // Adiciona mensagem de erro no chat
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: 'Desculpe, estou com problemas para responder agora. Você pode tentar novamente ou falar direto no WhatsApp! 😊',
          sender: 'bot'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const messageToSend = input.trim() || 'Olá! Gostaria de mais informações sobre as semijoias.';
    const phoneNumber = '5583981673349';
    const message = encodeURIComponent(messageToSend);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    // Limpa o input após enviar
    setInput('');
  };

  const handleRetry = () => {
    if (messages.length > 1) {
      const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
      if (lastUserMessage) {
        setInput(lastUserMessage.text);
      }
    }
    setError(null);
  };

  return (
    <div className="chat-container" role="region" aria-label="Janela de chat no estilo WhatsApp">
      <div className="chat-header">
        <span>💎 Gabrielly Semijoias - Assistente</span>
      </div>

      <div className="message-list" role="log" aria-live="polite">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.sender === 'bot' && <span className="message-icon">🤖</span>}
            <div className="message-bubble">{msg.text}</div>
            {msg.sender === 'user' && <span className="message-status">✓✓</span>}
          </div>
        ))}

        {isLoading && (
          <div className="loading-message">
            Digitando<span className="loading-dot">...</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
            <button className="retry-button" onClick={handleRetry} aria-label="Tentar novamente">
              🔄 Tentar novamente
            </button>
          </div>
        )}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
          placeholder="Digite uma mensagem..."
          aria-label="Digite sua mensagem e pressione Enter ou clique no ícone para enviar"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          aria-label="Enviar mensagem no chat"
          disabled={isLoading || !input.trim()}
          className="send-btn"
        >
          <FaPaperPlane />
        </button>
        <button
          onClick={handleWhatsAppRedirect}
          className="whatsapp-btn"
          aria-label="Enviar mensagem para WhatsApp"
          disabled={isLoading}
          title="Falar direto no WhatsApp"
        >
          📱 WhatsApp
        </button>
      </div>
    </div>
  );
}

export default Chat;