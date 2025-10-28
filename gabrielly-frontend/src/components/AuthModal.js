import React, { useState } from 'react';
import '../styles/AuthModal.css';
import { authAPI } from '../api';

const AuthModal = ({ isOpen, onClose }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
        setLoading(true);

        // Validações
        if (!isLoginMode && formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem');
            setLoading(false);
            return;
        }

        if (!isLoginMode && formData.password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            let data;
            if (isLoginMode) {
                const body = { email: formData.email, password: formData.password };
                data = await authAPI.login(body);
            } else {
                const body = { name: formData.name, email: formData.email, password: formData.password };
                data = await authAPI.register(body);
            }

            // Armazena o token e informações do usuário
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Feedback visual
            setError('');
            
            // Fecha o modal e atualiza a página
            setTimeout(() => {
                onClose();
                window.location.reload();
            }, 500);

        } catch (error) {
            console.error('Erro na autenticação:', error);
            setError(error.message || 'Ocorreu um erro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setError('');
        setFormData({
            email: '',
            password: '',
            name: '',
            confirmPassword: ''
        });
    };

    if (!isOpen) return null;

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>
                
                <div className="auth-header">
                    <h2>{isLoginMode ? 'Login' : 'Criar Conta'}</h2>
                    <div className="auth-toggle">
                        <button
                            type="button"
                            className={isLoginMode ? 'active' : ''}
                            onClick={() => setIsLoginMode(true)}
                            disabled={loading}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            className={!isLoginMode ? 'active' : ''}
                            onClick={() => setIsLoginMode(false)}
                            disabled={loading}
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
                                placeholder="Seu nome completo"
                                disabled={loading}
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
                            placeholder="seu@email.com"
                            disabled={loading}
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
                            placeholder={isLoginMode ? "Sua senha" : "Mínimo 6 caracteres"}
                            disabled={loading}
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
                                placeholder="Repita sua senha"
                                disabled={loading}
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? (isLoginMode ? 'Entrando...' : 'Cadastrando...') : (isLoginMode ? 'Entrar' : 'Criar conta')}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        {isLoginMode ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                        {' '}
                        <button 
                            type="button" 
                            onClick={toggleMode} 
                            className="toggle-link"
                            disabled={loading}
                        >
                            {isLoginMode ? 'Cadastre-se' : 'Faça login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;