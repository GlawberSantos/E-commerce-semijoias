import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verifica se há um token salvo
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            const userData = JSON.parse(savedUser);
            
            // CORREÇÃO: Adiciona a role de admin ao carregar do localStorage
            if (userData.name === 'admin' && userData.role !== 'admin') {
                userData.role = 'admin';
                localStorage.setItem('user', JSON.stringify(userData));
            }
            
            setUser(userData);
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        // Adiciona a role de admin para o usuário de exemplo
        if (userData.name === 'admin') {
            userData.role = 'admin';
        }
        setUser(userData);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const updateUser = (userData) => {
        // Mantém a role de admin se for o email admin
        if (userData.name === 'admin') {
            userData.role = 'admin';
        }
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

export default AuthContext;