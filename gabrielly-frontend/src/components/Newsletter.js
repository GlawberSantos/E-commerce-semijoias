import React, { useState } from 'react';
import { newsletterAPI } from '../api';
import '../styles/Newsletter.css';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await newsletterAPI.subscribe({ email });
            setMessage(response.message);
            setEmail('');
        } catch (err) {
            setError(err.message || 'Ocorreu um erro. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="newsletter-container">
            <h3>Fique por dentro das novidades!</h3>
            <p>Cadastre-se e receba nossas promoções e lançamentos em primeira mão.</p>
            <form onSubmit={handleSubmit} className="newsletter-form">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu e-mail"
                    required
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Enviando...' : 'Cadastrar'}
                </button>
            </form>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default Newsletter;
