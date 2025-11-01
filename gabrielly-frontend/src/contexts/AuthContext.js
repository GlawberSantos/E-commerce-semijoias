import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleUser = (userData) => {
        if (userData && userData.name === 'admin') {
            userData.role = 'admin';
        }
        setUser(userData);
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            localStorage.removeItem('user');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            const userData = JSON.parse(savedUser);
            handleUser(userData);
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        handleUser(userData);
        localStorage.setItem('token', token);
    };

    const logout = () => {
        handleUser(null);
        localStorage.removeItem('token');
    };

    const updateUser = (userData) => {
        handleUser(userData);
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