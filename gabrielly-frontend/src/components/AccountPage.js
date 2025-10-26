import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/AccountPage.css';

const AccountPage = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('http://localhost:3001/api/user/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao atualizar dados');
            }

            updateUser(data.user);
            setMessage({
                type: 'success',
                text: 'Dados atualizados com sucesso!'
            });

        } catch (error) {
            setMessage({
                type: 'error',
                text: error.message
            });
        }
    };

    return (
        <div className="account-page">
            <h1>Minha Conta</h1>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="account-grid">
                <section className="profile-section">
                    <h2>Dados Pessoais</h2>
                    <form onSubmit={handleSubmit}>
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
                            <label htmlFor="phone">Telefone</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="(00) 00000-0000"
                            />
                        </div>

                        <button type="submit" className="save-button">
                            Salvar alterações
                        </button>
                    </form>
                </section>

                <section className="password-section">
                    <h2>Alterar Senha</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="currentPassword">Senha atual</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">Nova senha</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar nova senha</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>

                        <button type="submit" className="change-password-button">
                            Alterar senha
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default AccountPage;