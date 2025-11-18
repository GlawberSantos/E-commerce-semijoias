import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api';
import '../styles/AccountPage.css';

const AccountPage = () => {
    const { user, updateUser } = useAuth();

    const [detailsData, setDetailsData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setDetailsData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handleDetailsChange = (e) => {
        setDetailsData({ ...detailsData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleDetailsSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const { user } = await authAPI.updateDetails(detailsData);
            updateUser(user);
            setMessage({ type: 'success', text: 'Dados atualizados com sucesso!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Erro ao atualizar dados.' });
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setMessage({ type: 'error', text: 'As novas senhas não coincidem.' });
        }

        try {
            const { message: successMessage } = await authAPI.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: successMessage });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Limpa os campos
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Erro ao alterar a senha.' });
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
                    <form onSubmit={handleDetailsSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Nome completo</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={detailsData.name}
                                onChange={handleDetailsChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={detailsData.email}
                                onChange={handleDetailsChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Telefone</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={detailsData.phone}
                                onChange={handleDetailsChange}
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
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                            <label htmlFor="currentPassword">Senha atual</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">Nova senha</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirmar nova senha</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
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