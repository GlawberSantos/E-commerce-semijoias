import React, { useState } from 'react';
import '../styles/AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isLoginMode && formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        try {
            // Aqui você implementará a lógica de autenticação com seu backend
            const response = await fetch(
                `http://localhost:3001/api/auth/${isLoginMode ? 'login' : 'register'}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro na autenticação');
            }

            // Armazena o token e informações do usuário
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Fecha o modal e atualiza o estado da aplicação
            onClose();
            window.location.reload(); // Atualiza a página para refletir o login

        } catch (error) {
            setError(error.message || 'Ocorreu um erro. Tente novamente.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="auth-modal-overlay">
            <div className="auth-modal">
                <button className="close-button" onClick={onClose}>&times;</button>
                
                <div className="auth-header">
                    <h2>{isLoginMode ? 'Login' : 'Criar Conta'}</h2>
                    <div className="auth-toggle">
                        <button
                            className={isLoginMode ? 'active' : ''}
                            onClick={() => setIsLoginMode(true)}
                        >
                            Login
                        </button>
                        <button
                            className={!isLoginMode ? 'active' : ''}
                            onClick={() => setIsLoginMode(false)}
                        >
                            Cadastro
                        </button>
                    </div>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLoginMode && (
                        <div className="form-group">
                            <label htmlFor="name">Nome completo</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {!isLoginMode && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar senha</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="auth-submit">
                        {isLoginMode ? 'Entrar' : 'Criar conta'}
                    </button>
                </form>

                {isLoginMode && (
                    <button className="forgot-password">
                        Esqueceu sua senha?
                    </button>
                )}

                <div className="social-login">
                    <p>Ou continue com</p>
                    <div className="social-buttons">
                        <button className="google">
                            <i className="fab fa-google"></i>
                            Google
                        </button>
                        <button className="facebook">
                            <i className="fab fa-facebook"></i>
                            Facebook
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;